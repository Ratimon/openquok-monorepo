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

const PASSWORD = "Test1234!";

function categoryCreateBody() {
    return {
        categoryData: {
            name: `Category-${faker.string.alpha(6)}-${Date.now()}`,
            description: "Category for listing integration tests",
        },
        categoryGroupIds: [] as string[],
    };
}

function tagCreateBody() {
    return {
        tagData: {
            name: `Tag-${faker.string.alpha(6)}-${Date.now()}`,
        },
        tagGroupIds: [] as string[],
    };
}

/**
 * Listing RBAC integration tests. Requires user_roles, listings, listing_categories, listing_tags.
 */
describe("Listing RBAC", () => {
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

    let emailSendSpy: jest.SpyInstance;
    let superAdminToken: string;
    let superAdminPublicId: string;
    let editorToken: string;
    let editorPublicId: string;
    let normalUserToken: string;
    let testCategoryId: string;
    let testTagId: string;
    let testTagSlug: string;

    beforeAll(async () => {
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);
    });

    afterAll(async () => {
        await listingHelper.cleanTrackedListingData();
        emailSendSpy?.mockRestore();
        await userHelper.cleanAll();
    });

    beforeEach(async () => {
        superAdminToken = "";
        superAdminPublicId = "";
        editorToken = "";
        editorPublicId = "";
        normalUserToken = "";
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
        const normalUserData = {
            id: uuidv4(),
            email: `normal-${uuidv4()}@test.com`,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        };

        const superAdmin = await userHelper.createVerifiedUserWithAuthAndDatabase(superAdminData, {
            isPlatformAdmin: true,
            isEmailVerified: true,
        });
        const editor = await userHelper.createVerifiedUserWithAuthAndDatabase(editorData, {
            isEmailVerified: true,
        });
        const normalUser = await userHelper.createVerifiedUserWithAuthAndDatabase(normalUserData, {
            isEmailVerified: true,
        });

        superAdminPublicId = superAdmin.publicId;
        editorPublicId = editor.publicId;

        const getAccessToken = (res: supertest.Response): string => {
            const data = res.body?.data;
            const token =
                data?.accessToken ??
                data?.session?.accessToken ??
                (data?.session && (data.session as { access_token?: string }).access_token);
            const str = typeof token === "string" ? token.trim() : "";
            if (!str) throw new Error(`No accessToken in sign-in response: ${JSON.stringify(res.body)}`);
            return str;
        };

        const superSignIn = await supertest(app)
            .post(`${authPath}/sign-in`)
            .send({ email: superAdminData.email, password: superAdminData.password });
        expect(superSignIn.status).toBe(200);
        superAdminToken = getAccessToken(superSignIn);

        const editorSignIn = await supertest(app)
            .post(`${authPath}/sign-in`)
            .send({ email: editorData.email, password: editorData.password });
        expect(editorSignIn.status).toBe(200);
        editorToken = getAccessToken(editorSignIn);

        const normalSignIn = await supertest(app)
            .post(`${authPath}/sign-in`)
            .send({ email: normalUserData.email, password: normalUserData.password });
        expect(normalSignIn.status).toBe(200);
        normalUserToken = getAccessToken(normalSignIn);

        const assignRes = await supertest(app)
            .post(`${usersPath}/${editorPublicId}/roles/editor`)
            .set("Authorization", `Bearer ${superAdminToken}`);
        expect(assignRes.status).toBe(200);

        const categoryRes = await supertest(app)
            .post(`${listingPath}/categories`)
            .set("Authorization", `Bearer ${editorToken}`)
            .send(categoryCreateBody())
            .expect(201);
        testCategoryId = categoryRes.body.data.id;
        listingHelper.trackCategory(testCategoryId);

        const tagBody = tagCreateBody();
        const tagRes = await supertest(app)
            .post(`${listingPath}/tags`)
            .set("Authorization", `Bearer ${editorToken}`)
            .send(tagBody)
            .expect(201);
        testTagId = tagRes.body.data.id;
        testTagSlug = stringToSlug(tagBody.tagData.name);
        listingHelper.trackTag(testTagId);
    });

    function validExtensionBody(overrides?: {
        title?: string;
        isUserPublished?: boolean;
        isAdminPublished?: boolean;
        content?: string;
    }) {
        const title = overrides?.title ?? `Ext-${faker.string.alpha(6)}-${Date.now()}`;
        return {
            listingData: {
                title,
                description: "Test extension description.",
                excerpt: "Short excerpt.",
                content: overrides?.content ?? "# Skill\n\nBody content for markdown download.",
                listing_kind: "extension" as const,
                extension_type: "skills" as const,
                install_command_skills: "npx install-skill example",
                listing_category_id: testCategoryId,
                is_official: false,
                is_user_published: overrides?.isUserPublished ?? true,
                is_admin_published: overrides?.isAdminPublished,
            },
            listingTagsData: [{ id: testTagId, slug: testTagSlug }],
        };
    }

    function validStackBody(overrides?: { title?: string; isAdminPublished?: boolean }) {
        const title = overrides?.title ?? `Stack-${faker.string.alpha(6)}-${Date.now()}`;
        return {
            listingData: {
                title,
                description: "Test stack description.",
                listing_kind: "stack" as const,
                is_official: false,
                is_user_published: true,
                is_admin_published: overrides?.isAdminPublished,
            },
            listingTagsData: [] as Array<{ id: string; slug: string }>,
        };
    }

    async function createListingAs(
        token: string,
        body: ReturnType<typeof validExtensionBody> | ReturnType<typeof validStackBody>
    ): Promise<{ listingId: string; title: string }> {
        const res = await supertest(app)
            .post(`${listingPath}/`)
            .set("Authorization", `Bearer ${token}`)
            .send(body)
            .expect(201);
        const listingId = res.body.data.id as string;
        listingHelper.trackListing(listingId);
        return { listingId, title: body.listingData.title };
    }

    async function approveListingAs(
        token: string,
        listingId: string,
        body: ReturnType<typeof validExtensionBody> | ReturnType<typeof validStackBody>
    ): Promise<void> {
        await supertest(app)
            .put(`${listingPath}/${listingId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                listingData: {
                    ...body.listingData,
                    id: listingId,
                    is_admin_published: true,
                },
                listingTagsData: body.listingTagsData,
            })
            .expect(200);
    }

    describe("Public read", () => {
        it("GET /information returns module config", async () => {
            const res = await supertest(app).get(`${listingPath}/information`).expect(200);
            expect(res.body.success).toBe(true);
            expect(typeof res.body.data).toBe("object");
        });

        it("GET /published returns only dual-published extensions; unpublished slug returns 404", async () => {
            const body = validExtensionBody();
            const { listingId } = await createListingAs(editorToken, body);

            const draftGetRes = await supertest(app)
                .get(`${listingPath}/${listingId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            expect(draftGetRes.body.data.isUserPublished).toBe(true);
            expect(draftGetRes.body.data.isAdminPublished).toBe(false);
            const slug = draftGetRes.body.data.slug as string;

            await supertest(app).get(`${listingPath}/published/${slug}`).expect(404);

            const publishedBefore = await supertest(app)
                .get(`${listingPath}/published`)
                .query({ limit: 100 })
                .expect(200);
            expect(publishedBefore.body.data.some((l: { id: string }) => l.id === listingId)).toBe(false);

            await approveListingAs(superAdminToken, listingId, body);

            const publishedAfter = await supertest(app)
                .get(`${listingPath}/published`)
                .query({ limit: 100 })
                .expect(200);
            expect(publishedAfter.body.success).toBe(true);
            expect(publishedAfter.body.data.some((l: { id: string }) => l.id === listingId)).toBe(true);

            const bySlug = await supertest(app).get(`${listingPath}/published/${slug}`).expect(200);
            expect(bySlug.body.data.id).toBe(listingId);
        });
    });

    describe("Categories and tags", () => {
        it("GET /categories/active-partial and /tags/active-partial reflect published listings", async () => {
            const categoriesBefore = await supertest(app)
                .get(`${listingPath}/categories/active-partial`)
                .expect(200);
            expect(Array.isArray(categoriesBefore.body.data)).toBe(true);

            const tagsBefore = await supertest(app).get(`${listingPath}/tags/active-partial`).expect(200);
            expect(Array.isArray(tagsBefore.body.data)).toBe(true);

            const body = validExtensionBody();
            const { listingId } = await createListingAs(superAdminToken, {
                ...body,
                listingData: { ...body.listingData, is_admin_published: true },
            });

            const categoriesAfter = await supertest(app)
                .get(`${listingPath}/categories/active-partial`)
                .expect(200);
            const categoryMatch = categoriesAfter.body.data.find(
                (c: { id: string }) => c.id === testCategoryId
            );
            expect(categoryMatch).toBeDefined();

            const tagsAfter = await supertest(app).get(`${listingPath}/tags/active-partial`).expect(200);
            const tagMatch = tagsAfter.body.data.find((t: { id: string }) => t.id === testTagId);
            expect(tagMatch).toBeDefined();

            const adminGet = await supertest(app)
                .get(`${listingPath}/${listingId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            expect(adminGet.body.data.listingCategoryId).toBe(testCategoryId);
        });
    });

    describe("Stats", () => {
        it("PUT /stats/views/:id increments counter without auth", async () => {
            const body = validExtensionBody();
            const { listingId } = await createListingAs(superAdminToken, {
                ...body,
                listingData: { ...body.listingData, is_admin_published: true },
            });

            const beforeRes = await supertest(app)
                .get(`${listingPath}/${listingId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            const viewsBefore = beforeRes.body.data.views as number;

            await supertest(app).put(`${listingPath}/stats/views/${listingId}`).expect(200);

            const afterRes = await supertest(app)
                .get(`${listingPath}/${listingId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            expect(afterRes.body.data.views).toBeGreaterThan(viewsBefore);
        });
    });

    describe("Admin CRUD", () => {
        it("editor creates pending listing; GET /all-full includes it; super admin approves", async () => {
            const body = validExtensionBody({ title: `Pending-${Date.now()}` });
            const { listingId } = await createListingAs(editorToken, body);

            const adminRes = await supertest(app)
                .get(`${listingPath}/all-full`)
                .set("Authorization", `Bearer ${editorToken}`)
                .query({ limit: 50 })
                .expect(200);
            expect(adminRes.body.data.some((l: { id: string }) => l.id === listingId)).toBe(true);
            const pending = adminRes.body.data.find((l: { id: string }) => l.id === listingId);
            expect(pending.isAdminPublished).toBe(false);

            await approveListingAs(superAdminToken, listingId, body);

            const approvedGet = await supertest(app)
                .get(`${listingPath}/${listingId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            expect(approvedGet.body.data.isAdminPublished).toBe(true);
        });

        it("super admin creates listing that is immediately approved and public", async () => {
            const body = validExtensionBody({ title: `Immediate-${Date.now()}` });
            const { listingId } = await createListingAs(superAdminToken, {
                ...body,
                listingData: { ...body.listingData, is_admin_published: true },
            });

            const getRes = await supertest(app)
                .get(`${listingPath}/${listingId}`)
                .set("Authorization", `Bearer ${superAdminToken}`)
                .expect(200);
            expect(getRes.body.data.isAdminPublished).toBe(true);
            const slug = getRes.body.data.slug as string;

            await supertest(app).get(`${listingPath}/published/${slug}`).expect(200);
        });
    });

    describe("RBAC", () => {
        it("unauthenticated GET /all-full returns 401; normal user cannot POST /categories; editor can", async () => {
            await supertest(app).get(`${listingPath}/all-full`).query({ limit: 5 }).expect(401);

            await supertest(app)
                .get(`${listingPath}/all-full`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .query({ limit: 5 })
                .expect(403);

            await supertest(app).post(`${listingPath}/categories`).send(categoryCreateBody()).expect(401);

            await supertest(app)
                .post(`${listingPath}/categories`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send(categoryCreateBody())
                .expect(403);

            const createRes = await supertest(app)
                .post(`${listingPath}/categories`)
                .set("Authorization", `Bearer ${editorToken}`)
                .send(categoryCreateBody())
                .expect(201);
            listingHelper.trackCategory(createRes.body.data.id);
        });

        it("unauthenticated cannot create listing; normal user cannot; editor can", async () => {
            await supertest(app).post(`${listingPath}/`).send(validExtensionBody()).expect(401);
            await supertest(app)
                .post(`${listingPath}/`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send(validExtensionBody())
                .expect(403);

            const { listingId } = await createListingAs(editorToken, validExtensionBody());
            expect(listingId).toBeDefined();
        });
    });

    describe("Stacks", () => {
        it("GET /stacks/published filters listing_kind = stack", async () => {
            const stackBody = validStackBody({ title: `StackPub-${Date.now()}` });
            const { listingId: stackId } = await createListingAs(superAdminToken, {
                ...stackBody,
                listingData: { ...stackBody.listingData, is_admin_published: true },
            });

            const extBody = validExtensionBody({ title: `ExtNotStack-${Date.now()}` });
            const { listingId: extId } = await createListingAs(superAdminToken, {
                ...extBody,
                listingData: { ...extBody.listingData, is_admin_published: true },
            });

            const stacksRes = await supertest(app)
                .get(`${listingPath}/stacks/published`)
                .query({ limit: 50 })
                .expect(200);
            expect(stacksRes.body.data.some((l: { id: string }) => l.id === stackId)).toBe(true);
            expect(stacksRes.body.data.some((l: { id: string }) => l.id === extId)).toBe(false);
            stacksRes.body.data.forEach((l: { listingKind: string }) => {
                expect(l.listingKind).toBe("stack");
            });
        });
    });

    describe("Creators", () => {
        it("GET /creators returns users with published listings after username is set", async () => {
            const username = `creator-${faker.string.alphanumeric(8).toLowerCase()}`;
            await listingHelper.setUserUsername(editorPublicId, username);

            const body = validExtensionBody({ title: `CreatorExt-${Date.now()}` });
            const { listingId } = await createListingAs(editorToken, body);
            await approveListingAs(superAdminToken, listingId, body);

            const creatorsRes = await supertest(app).get(`${listingPath}/creators`).expect(200);
            expect(Array.isArray(creatorsRes.body.data)).toBe(true);
            const creator = creatorsRes.body.data.find((c: { username: string }) => c.username === username);
            expect(creator).toBeDefined();
            expect(creator.extension_count).toBeGreaterThanOrEqual(1);
        });
    });

    describe("Skill markdown", () => {
        it("GET /published/:slug/skill-markdown returns text/markdown body", async () => {
            const markdown = "# Apple Notes Skill\n\nCopy notes to your agent.";
            const body = validExtensionBody({
                title: `SkillMd-${Date.now()}`,
                content: markdown,
            });
            const { listingId } = await createListingAs(superAdminToken, {
                ...body,
                listingData: { ...body.listingData, is_admin_published: true },
            });

            const getRes = await supertest(app)
                .get(`${listingPath}/${listingId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            const slug = getRes.body.data.slug as string;

            const mdRes = await supertest(app)
                .get(`${listingPath}/published/${slug}/skill-markdown`)
                .expect(200);
            expect(mdRes.headers["content-type"]).toMatch(/text\/markdown/);
            expect(mdRes.text).toBe(markdown);
        });
    });
});
