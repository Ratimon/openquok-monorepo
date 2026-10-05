import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const linkDirectoryPath = `${apiPrefix}/link-directory`;

const PASSWORD = "Test1234!";

jest.setTimeout(90_000);

function getAccessToken(res: supertest.Response): string {
    const data = res.body?.data;
    const token =
        data?.accessToken ??
        data?.session?.accessToken ??
        (data?.session && (data.session as { access_token?: string }).access_token);
    const str = typeof token === "string" ? token.trim() : "";
    if (!str) throw new Error(`No accessToken in sign-in response: ${JSON.stringify(res.body)}`);
    return str;
}

describe("Link directory site engagement", () => {
    const supabaseConfig = config.supabase as {
        supabaseUrl: string;
        supabaseSecretKey?: string;
    };
    const adminSupabase = createClient(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseSecretKey!
    ) as SupabaseClient;
    const userHelper = new UserTestHelper();

    const createdSiteIds: string[] = [];

    let emailSendSpy: jest.SpyInstance;
    let editorToken: string;
    let superAdminToken: string;
    let superAdminPublicId: string;

    beforeAll(() => {
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);
    });

    afterAll(async () => {
        if (createdSiteIds.length > 0) {
            try {
                await adminSupabase.from("link_directory_sites").delete().in("id", createdSiteIds);
            } catch {
                // ignore cleanup errors
            }
        }
        emailSendSpy?.mockRestore();
        await userHelper.cleanAll();
    });

    beforeEach(async () => {
        editorToken = "";
        superAdminToken = "";
        superAdminPublicId = "";

        const editorData = {
            id: uuidv4(),
            email: `ld-editor-${uuidv4()}@test.com`,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        };
        const superAdminData = {
            id: uuidv4(),
            email: `ld-super-${uuidv4()}@test.com`,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        };
        const editor = await userHelper.createVerifiedUserWithAuthAndDatabase(editorData, {
            isEmailVerified: true,
        });
        const superAdmin = await userHelper.createVerifiedUserWithAuthAndDatabase(superAdminData, {
            isPlatformAdmin: true,
            isEmailVerified: true,
        });
        superAdminPublicId = superAdmin.publicId;

        superAdminToken = getAccessToken(
            await supertest(app)
                .post(`${authPath}/sign-in`)
                .send({ email: superAdminData.email, password: superAdminData.password })
                .expect(200)
        );
        editorToken = getAccessToken(
            await supertest(app)
                .post(`${authPath}/sign-in`)
                .send({ email: editorData.email, password: editorData.password })
                .expect(200)
        );

        await supertest(app)
            .post(`${usersPath}/${editor.publicId}/roles/editor`)
            .set("Authorization", `Bearer ${superAdminToken}`)
            .expect(200);
    });

    function siteBody(isAdminPublished: boolean) {
        const suffix = `${Date.now()}-${faker.string.alphanumeric(8).toLowerCase()}`;
        const slug = `engagement-test-${suffix}`;
        return {
            slug,
            body: {
                siteData: {
                    slug,
                    title: `Engagement test ${suffix}`,
                    site_url: `https://example.com/${suffix}`,
                    is_admin_published: isAdminPublished,
                },
            },
        };
    }

    async function createSite(isAdminPublished: boolean): Promise<{ id: string; slug: string }> {
        const { slug, body } = siteBody(isAdminPublished);
        const res = await supertest(app)
            .post(`${linkDirectoryPath}/sites`)
            .set("Authorization", `Bearer ${editorToken}`)
            .send(body)
            .expect(201);
        const id = res.body.data.id as string;
        createdSiteIds.push(id);
        return { id, slug };
    }

    it("records views and likes on a published site", async () => {
        const { id: siteId, slug } = await createSite(true);

        await supertest(app).post(`${linkDirectoryPath}/sites/${siteId}/views`).expect(200);
        await supertest(app).post(`${linkDirectoryPath}/sites/${siteId}/likes`).expect(200);

        const siteRes = await supertest(app)
            .get(`${linkDirectoryPath}/published/${slug}`)
            .expect(200);

        expect(siteRes.body.data.views).toBeGreaterThanOrEqual(1);
        expect(siteRes.body.data.likes).toBeGreaterThanOrEqual(1);
    });

    it("rejects view increments on unpublished sites", async () => {
        const { id: siteId } = await createSite(false);

        const res = await supertest(app)
            .post(`${linkDirectoryPath}/sites/${siteId}/views`)
            .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/not published/i);
    });

    it("upserts a rating and exposes aggregates on the published site", async () => {
        const { id: siteId, slug } = await createSite(true);

        await supertest(app)
            .put(`${linkDirectoryPath}/sites/${siteId}/ratings`)
            .set("Authorization", `Bearer ${superAdminToken}`)
            .send({ rating: 4 })
            .expect(200);

        const siteRes = await supertest(app)
            .get(`${linkDirectoryPath}/published/${slug}`)
            .expect(200);

        expect(siteRes.body.data.ratingsCount).toBe(1);
        expect(siteRes.body.data.averageRating).toBe(4);
    });

    it("hides unapproved comments from the public list until an editor approves", async () => {
        const { id: siteId } = await createSite(true);

        const createRes = await supertest(app)
            .post(`${linkDirectoryPath}/sites/${siteId}/comments`)
            .set("Authorization", `Bearer ${superAdminToken}`)
            .send({ content: "Helpful backlink guide — thanks!" })
            .expect(201);

        const commentId = createRes.body.data.id as string;

        const pendingList = await supertest(app)
            .get(`${linkDirectoryPath}/sites/${siteId}/comments`)
            .expect(200);
        expect(pendingList.body.data).toHaveLength(0);

        await supertest(app)
            .patch(`${linkDirectoryPath}/admin/site-comments/${commentId}/approve`)
            .set("Authorization", `Bearer ${editorToken}`)
            .expect(200);

        const approvedList = await supertest(app)
            .get(`${linkDirectoryPath}/sites/${siteId}/comments`)
            .expect(200);

        expect(approvedList.body.data).toHaveLength(1);
        expect(approvedList.body.data[0].content).toContain("Helpful backlink guide");
        expect(approvedList.body.data[0].userId).toBe(superAdminPublicId);
    });
});
