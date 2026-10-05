import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import { ListingTestHelper } from "../helpers/listingTestHelper";
import { stringToSlug } from "../../utils/blog/slug";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const listingPath = `${apiPrefix}/listings`;
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

/**
 * Listing bookmarks and link-directory saved sites: published-only writes and per-user isolation.
 */
describe("Bookmark and saved sites security", () => {
    const supabaseConfig = config.supabase as {
        supabaseUrl: string;
        supabaseSecretKey?: string;
    };
    const adminSupabase = createClient(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseSecretKey!
    ) as SupabaseClient;
    const userHelper = new UserTestHelper();
    const listingHelper = new ListingTestHelper(adminSupabase);

    const createdLinkDirectorySiteIds: string[] = [];

    let emailSendSpy: jest.SpyInstance;
    let superAdminToken: string;
    let editorToken: string;
    let userAToken: string;
    let userBToken: string;
    let testCategoryId: string;
    let testTagId: string;
    let testTagSlug: string;

    beforeAll(async () => {
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);
    });

    afterAll(async () => {
        if (createdLinkDirectorySiteIds.length > 0) {
            try {
                await adminSupabase
                    .from("link_directory_sites")
                    .delete()
                    .in("id", createdLinkDirectorySiteIds);
            } catch {
                // ignore cleanup errors
            }
        }
        await listingHelper.cleanTrackedListingData();
        emailSendSpy?.mockRestore();
        await userHelper.cleanAll();
    });

    beforeEach(async () => {
        superAdminToken = "";
        editorToken = "";
        userAToken = "";
        userBToken = "";
        testCategoryId = "";
        testTagId = "";
        testTagSlug = "";

        const superAdminData = {
            id: uuidv4(),
            email: `super-${uuidv4()}@test.com`,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        };
        const editorData = {
            id: uuidv4(),
            email: `editor-${uuidv4()}@test.com`,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        };
        const userAData = {
            id: uuidv4(),
            email: `user-a-${uuidv4()}@test.com`,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        };
        const userBData = {
            id: uuidv4(),
            email: `user-b-${uuidv4()}@test.com`,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        };

        const editor = await userHelper.createVerifiedUserWithAuthAndDatabase(editorData, {
            isEmailVerified: true,
        });
        await userHelper.createVerifiedUserWithAuthAndDatabase(superAdminData, {
            isPlatformAdmin: true,
            isEmailVerified: true,
        });
        await userHelper.createVerifiedUserWithAuthAndDatabase(userAData, {
            isEmailVerified: true,
        });
        await userHelper.createVerifiedUserWithAuthAndDatabase(userBData, {
            isEmailVerified: true,
        });

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
        userAToken = getAccessToken(
            await supertest(app)
                .post(`${authPath}/sign-in`)
                .send({ email: userAData.email, password: userAData.password })
                .expect(200)
        );
        userBToken = getAccessToken(
            await supertest(app)
                .post(`${authPath}/sign-in`)
                .send({ email: userBData.email, password: userBData.password })
                .expect(200)
        );

        await supertest(app)
            .post(`${usersPath}/${editor.publicId}/roles/editor`)
            .set("Authorization", `Bearer ${superAdminToken}`)
            .expect(200);

        const categoryRes = await supertest(app)
            .post(`${listingPath}/categories`)
            .set("Authorization", `Bearer ${editorToken}`)
            .send({
                categoryData: {
                    name: `Cat-${faker.string.alpha(6)}-${Date.now()}`,
                    description: "Bookmark integration category",
                },
                categoryGroupIds: [],
            })
            .expect(201);
        testCategoryId = categoryRes.body.data.id;
        listingHelper.trackCategory(testCategoryId);

        const tagName = `Tag-${faker.string.alpha(6)}-${Date.now()}`;
        const tagRes = await supertest(app)
            .post(`${listingPath}/tags`)
            .set("Authorization", `Bearer ${editorToken}`)
            .send({ tagData: { name: tagName }, tagGroupIds: [] })
            .expect(201);
        testTagId = tagRes.body.data.id;
        testTagSlug = stringToSlug(tagName);
        listingHelper.trackTag(testTagId);
    });

    function validExtensionBody(overrides?: {
        title?: string;
        isUserPublished?: boolean;
        isAdminPublished?: boolean;
    }) {
        const title = overrides?.title ?? `Ext-${faker.string.alpha(6)}-${Date.now()}`;
        return {
            listingData: {
                title,
                description: "Bookmark integration listing.",
                excerpt: "Short excerpt.",
                content: "# Skill\n\nBody.",
                listing_kind: "extension" as const,
                extension_type: "skills" as const,
                install_command_skills: "npx install-skill example",
                listing_category_id: testCategoryId,
                is_official: false,
                is_user_published: overrides?.isUserPublished ?? true,
                is_admin_published: overrides?.isAdminPublished,
                schema_type: "SoftwareApplication" as const,
            },
            listingTagsData: [{ id: testTagId, slug: testTagSlug }],
        };
    }

    async function createPublishedListing(): Promise<string> {
        const body = validExtensionBody();
        const res = await supertest(app)
            .post(`${listingPath}/`)
            .set("Authorization", `Bearer ${superAdminToken}`)
            .send({
                ...body,
                listingData: { ...body.listingData, is_admin_published: true },
            })
            .expect(201);
        const listingId = res.body.data.id as string;
        listingHelper.trackListing(listingId);
        return listingId;
    }

    async function createDraftListing(): Promise<string> {
        const body = validExtensionBody({ title: `Draft-${Date.now()}` });
        const res = await supertest(app)
            .post(`${listingPath}/`)
            .set("Authorization", `Bearer ${editorToken}`)
            .send(body)
            .expect(201);
        const listingId = res.body.data.id as string;
        listingHelper.trackListing(listingId);
        return listingId;
    }

    function linkDirectorySiteBody(isAdminPublished: boolean) {
        const suffix = `${Date.now()}-${faker.string.alphanumeric(8).toLowerCase()}`;
        return {
            siteData: {
                slug: `bookmark-test-${suffix}`,
                title: `Bookmark test site ${suffix}`,
                site_url: `https://example.com/${suffix}`,
                is_admin_published: isAdminPublished,
            },
        };
    }

    async function createLinkDirectorySite(isAdminPublished: boolean): Promise<string> {
        const res = await supertest(app)
            .post(`${linkDirectoryPath}/sites`)
            .set("Authorization", `Bearer ${editorToken}`)
            .send(linkDirectorySiteBody(isAdminPublished))
            .expect(201);
        const siteId = res.body.data.id as string;
        createdLinkDirectorySiteIds.push(siteId);
        return siteId;
    }

    describe("Listing bookmarks", () => {
        it("user can bookmark a published listing and see it on GET /me/bookmarks", async () => {
            const listingId = await createPublishedListing();

            await supertest(app)
                .post(`${listingPath}/${listingId}/bookmark`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);

            const bookmarksRes = await supertest(app)
                .get(`${listingPath}/me/bookmarks`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);

            expect(bookmarksRes.body.success).toBe(true);
            expect(bookmarksRes.body.data.some((l: { id: string }) => l.id === listingId)).toBe(true);
        });

        it("rejects bookmarking a draft listing (not admin-published) with 400", async () => {
            const listingId = await createDraftListing();

            const bookmarkRes = await supertest(app)
                .post(`${listingPath}/${listingId}/bookmark`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(400);

            expect(bookmarkRes.body.success).toBe(false);
            expect(bookmarkRes.body.message).toMatch(/cannot be bookmarked/i);

            const bookmarksRes = await supertest(app)
                .get(`${listingPath}/me/bookmarks`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);
            expect(bookmarksRes.body.data.some((l: { id: string }) => l.id === listingId)).toBe(false);
        });

        it("GET /me/bookmarks for user B does not include user A bookmarks (IDOR smoke)", async () => {
            const listingId = await createPublishedListing();

            await supertest(app)
                .post(`${listingPath}/${listingId}/bookmark`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);

            const userABookmarks = await supertest(app)
                .get(`${listingPath}/me/bookmarks`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);
            expect(userABookmarks.body.data.some((l: { id: string }) => l.id === listingId)).toBe(true);

            const userBBookmarks = await supertest(app)
                .get(`${listingPath}/me/bookmarks`)
                .set("Authorization", `Bearer ${userBToken}`)
                .expect(200);
            expect(userBBookmarks.body.data.some((l: { id: string }) => l.id === listingId)).toBe(false);
        });
    });

    describe("Link directory saved sites", () => {
        it("user can save a published site and GET /me/saved-sites returns it", async () => {
            const publishedSiteId = await createLinkDirectorySite(true);

            await supertest(app)
                .put(`${linkDirectoryPath}/me/saved-sites`)
                .set("Authorization", `Bearer ${userAToken}`)
                .send({ siteIds: [publishedSiteId] })
                .expect(200);

            const savedRes = await supertest(app)
                .get(`${linkDirectoryPath}/me/saved-sites`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);

            expect(savedRes.body.success).toBe(true);
            expect(savedRes.body.data.some((row: { siteId: string }) => row.siteId === publishedSiteId)).toBe(
                true
            );
        });

        it("rejects PUT /me/saved-sites with an unpublished site id with 400", async () => {
            const draftSiteId = await createLinkDirectorySite(false);

            const putRes = await supertest(app)
                .put(`${linkDirectoryPath}/me/saved-sites`)
                .set("Authorization", `Bearer ${userAToken}`)
                .send({ siteIds: [draftSiteId] })
                .expect(400);

            expect(putRes.body.success).toBe(false);
            expect(putRes.body.message).toMatch(/invalid or not published/i);

            const savedRes = await supertest(app)
                .get(`${linkDirectoryPath}/me/saved-sites`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);
            expect(savedRes.body.data.some((row: { siteId: string }) => row.siteId === draftSiteId)).toBe(
                false
            );
        });

        it("GET /me/saved-sites for user B does not include user A shortlist (IDOR smoke)", async () => {
            const publishedSiteId = await createLinkDirectorySite(true);

            await supertest(app)
                .put(`${linkDirectoryPath}/me/saved-sites`)
                .set("Authorization", `Bearer ${userAToken}`)
                .send({ siteIds: [publishedSiteId] })
                .expect(200);

            const userBSaved = await supertest(app)
                .get(`${linkDirectoryPath}/me/saved-sites`)
                .set("Authorization", `Bearer ${userBToken}`)
                .expect(200);

            expect(
                userBSaved.body.data.some((row: { siteId: string }) => row.siteId === publishedSiteId)
            ).toBe(false);
        });
    });
});
