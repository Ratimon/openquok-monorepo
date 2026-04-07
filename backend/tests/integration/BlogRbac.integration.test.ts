import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import { BlogTestHelper } from "../helpers/blogTestHelper";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const blogPath = `${apiPrefix}/blog-system`;

function topicCreateBody() {
    return {
        name: `Integration-Topic-${faker.string.alpha(6)}-${Date.now()}`,
        description: "Topic created via API for blog integration tests",
    };
}

const PASSWORD = "Test1234!";

/**
 * Blog RBAC integration tests. Requires user_roles, blog_posts, blog_topics.
 * Simplified: grouped flows, shared helpers, fewer duplicate setups.
 */
describe("Blog RBAC", () => {
    const supabaseConfig = config.supabase as {
        supabaseUrl: string;
        supabaseServiceRoleKey?: string;
    };
    const adminSupabase = createClient(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseServiceRoleKey!
    ) as SupabaseClient;
    const userHelper = new UserTestHelper();
    const blogHelper = new BlogTestHelper(adminSupabase);

    let emailSendSpy: jest.SpyInstance;
    let superAdminToken: string;
    let superAdminPublicId: string;
    let editorToken: string;
    let editorPublicId: string;
    let normalUserToken: string;
    let normalUserPublicId: string;
    let testTopicId: string;

    beforeAll(async () => {
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);
    });

    afterAll(async () => {
        await blogHelper.cleanTrackedBlogData();
        emailSendSpy?.mockRestore();
        await userHelper.cleanAll();
    });

    beforeEach(async () => {
        superAdminToken = "";
        superAdminPublicId = "";
        editorToken = "";
        editorPublicId = "";
        normalUserToken = "";
        normalUserPublicId = "";
        testTopicId = "";

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
            isSuperAdmin: true,
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
        normalUserPublicId = normalUser.publicId;

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

        const topicRes = await supertest(app)
            .post(`${blogPath}/topics`)
            .set("Authorization", `Bearer ${editorToken}`)
            .send(topicCreateBody())
            .expect(201);
        testTopicId = topicRes.body.data.id;
        blogHelper.trackTopic(testTopicId);
    });

    function validPostBody(overrides?: { title?: string }) {
        const title = overrides?.title ?? `Post-${faker.string.alpha(6)}-${Date.now()}`;
        return {
            title,
            description: "Test description.",
            content: "Test content.",
            topic_id: testTopicId,
            is_user_published: true,
            is_sponsored: false,
            is_featured: false,
        };
    }

    /** Create a post as editor or superAdmin; track and return { postId, body }. */
    async function createPostAs(
        token: string,
        overrides?: { title?: string }
    ): Promise<{ postId: string; body: ReturnType<typeof validPostBody> }> {
        const body = validPostBody(overrides);
        const res = await supertest(app)
            .post(`${blogPath}/posts`)
            .set("Authorization", `Bearer ${token}`)
            .send(body)
            .expect(201);
        const postId = res.body.data.id;
        blogHelper.trackPost(postId);
        return { postId, body };
    }

    describe("Topics: create and update", () => {
        it("editor can create and update a topic; unauthenticated and normal user cannot create", async () => {
            const createBody = {
                name: `Topic-${faker.string.alpha(6)}-${Date.now()}`,
                description: "Description",
            };
            const createRes = await supertest(app)
                .post(`${blogPath}/topics`)
                .set("Authorization", `Bearer ${editorToken}`)
                .send(createBody)
                .expect(201);
            expect(createRes.body.data?.id).toBeDefined();
            const topicId = createRes.body.data.id;
            blogHelper.trackTopic(topicId);

            await supertest(app)
                .put(`${blogPath}/topics/${topicId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .send({ ...createBody, name: `Updated-${createBody.name}` })
                .expect(200);

            await supertest(app).post(`${blogPath}/topics`).send(topicCreateBody()).expect(401);
            await supertest(app)
                .post(`${blogPath}/topics`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send(topicCreateBody())
                .expect(403);
        });
    });

    describe("Posts: create and approve", () => {
        it("editor creates post (not approved); super admin can approve via PUT; then visible publicly", async () => {
            const { postId } = await createPostAs(editorToken);
            const ownerGetRes = await supertest(app)
                .get(`${blogPath}/posts/${postId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            expect(ownerGetRes.body.data.isUserPublished).toBe(true);
            expect(ownerGetRes.body.data.isAdminApproved).toBe(false);

            await supertest(app)
                .put(`${blogPath}/posts/${postId}`)
                .set("Authorization", `Bearer ${superAdminToken}`)
                .send(validPostBody({ title: `Approved-${Date.now()}` }))
                .expect(200);

            const afterGetRes = await supertest(app)
                .get(`${blogPath}/posts/${postId}`)
                .set("Authorization", `Bearer ${superAdminToken}`)
                .expect(200);
            expect(afterGetRes.body.data.isAdminApproved).toBe(true);
            const slug = afterGetRes.body.data.slug;

            const bySlug = await supertest(app).get(`${blogPath}/posts/${slug}`).expect(200);
            expect(bySlug.body.data.id).toBe(postId);

            const authorsRes = await supertest(app).get(`${blogPath}/authors`).expect(200);
            const editorAuthor = authorsRes.body.data.find((a: { id: string }) => a.id === editorPublicId);
            expect(editorAuthor).toBeDefined();
            expect(editorAuthor.postCount).toBeGreaterThanOrEqual(1);
        });

        it("super admin creates post that is immediately approved and visible by slug", async () => {
            const { postId, body } = await createPostAs(superAdminToken);
            const getRes = await supertest(app)
                .get(`${blogPath}/posts/${postId}`)
                .set("Authorization", `Bearer ${superAdminToken}`)
                .expect(200);
            expect(getRes.body.data.isAdminApproved).toBe(true);
            const slug = getRes.body.data.slug;

            const bySlug = await supertest(app).get(`${blogPath}/posts/${slug}`).expect(200);
            expect(bySlug.body.data.id).toBe(postId);
            expect(bySlug.body.data.title).toBe(body.title);
        });

        it("unauthenticated cannot create post (401); normal user cannot (403)", async () => {
            await supertest(app).post(`${blogPath}/posts`).send(validPostBody()).expect(401);
            await supertest(app)
                .post(`${blogPath}/posts`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send(validPostBody())
                .expect(403);
        });
    });

    describe("Public access: posts, topics, comments", () => {
        it("unauthenticated can see published posts and authors", async () => {
            const listRes = await supertest(app)
                .get(`${blogPath}/posts`)
                .query({ limit: 5 })
                .expect(200);
            expect(listRes.body.success).toBe(true);
            expect(Array.isArray(listRes.body.data.postsResult)).toBe(true);
            expect(typeof listRes.body.data.countResult).toBe("number");

            const authorsRes = await supertest(app).get(`${blogPath}/authors`).expect(200);
            expect(Array.isArray(authorsRes.body.data)).toBe(true);
            authorsRes.body.data.forEach((a: { id: string; fullName: string | null; postCount: number }) => {
                expect(a).toHaveProperty("id");
                expect(a).toHaveProperty("fullName");
                expect(typeof a.postCount).toBe("number");
            });
        });

        it("unauthenticated can get active blog topics; topic appears with postCount after approved post", async () => {
            const activeRes = await supertest(app)
                .get(`${blogPath}/topics/active`)
                .expect(200);
            expect(activeRes.body.success).toBe(true);
            expect(Array.isArray(activeRes.body.data)).toBe(true);
            activeRes.body.data.forEach((t: { id: string; name: string; slug: string; postCount: number }) => {
                expect(t).toHaveProperty("id");
                expect(t).toHaveProperty("name");
                expect(t).toHaveProperty("slug");
                expect(t).toHaveProperty("postCount");
                expect(typeof t.postCount).toBe("number");
            });

            const { postId } = await createPostAs(superAdminToken);
            const afterRes = await supertest(app)
                .get(`${blogPath}/topics/active`)
                .expect(200);
            expect(afterRes.body.data.length).toBeGreaterThanOrEqual(1);
            const topicForPost = afterRes.body.data.find((t: { id: string }) => t.id === testTopicId);
            expect(topicForPost).toBeDefined();
            expect(topicForPost.postCount).toBeGreaterThanOrEqual(1);
            expect(topicForPost.name).toBeDefined();
            expect(topicForPost.slug).toBeDefined();
        });

        it("authenticated user can create and update comment; unauthenticated cannot", async () => {
            const { postId } = await createPostAs(superAdminToken);

            const listRes = await supertest(app)
                .get(`${blogPath}/posts`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .query({ limit: 10 })
                .expect(200);
            expect(listRes.body.data.postsResult.some((p: { id: string }) => p.id === postId)).toBe(true);

            const createComment = await supertest(app)
                .post(`${blogPath}/comments`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send({ post_id: postId, content: "A comment." })
                .expect(201);
            const commentId = createComment.body.data.id;
            expect(commentId).toBeDefined();

            await supertest(app)
                .put(`${blogPath}/comments/${commentId}`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send({ content: "Updated." })
                .expect(200);

            await supertest(app)
                .post(`${blogPath}/comments`)
                .send({ post_id: postId, content: "Rejected." })
                .expect(401);
            await supertest(app)
                .put(`${blogPath}/comments/${commentId}`)
                .send({ content: "Rejected." })
                .expect(401);
        });

        it("unauthenticated can read; empty when no comments; returns only approved comments after approval", async () => {
            const { postId } = await createPostAs(superAdminToken);

            const emptyRes = await supertest(app)
                .get(`${blogPath}/posts/${postId}/comments`)
                .expect(200);
            expect(emptyRes.body.success).toBe(true);
            expect(emptyRes.body.data).toEqual([]);

            const createRes = await supertest(app)
                .post(`${blogPath}/comments`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send({ post_id: postId, content: "Comment for GET test." })
                .expect(201);
            const commentId = createRes.body.data.id;

            const unapprovedRes = await supertest(app)
                .get(`${blogPath}/posts/${postId}/comments`)
                .expect(200);
            expect(unapprovedRes.body.data).toEqual([]);

            await supertest(app)
                .patch(`${blogPath}/comments/${commentId}/approve`)
                .set("Authorization", `Bearer ${superAdminToken}`)
                .expect(200);

            const approvedRes = await supertest(app)
                .get(`${blogPath}/posts/${postId}/comments`)
                .expect(200);
            expect(approvedRes.body.success).toBe(true);
            expect(Array.isArray(approvedRes.body.data)).toBe(true);
            expect(approvedRes.body.data).toHaveLength(1);
            const comment = approvedRes.body.data[0] as {
                id: string;
                content: string;
                isApproved: boolean;
                createdAt: string;
                updatedAt: string | null;
                parentId: string | null;
                userId: string;
                author: { id: string; fullName: string | null; avatarUrl: string | null } | null;
            };
            expect(comment.id).toBe(commentId);
            expect(comment.content).toBe("Comment for GET test.");
            expect(comment.isApproved).toBe(true);
            expect(comment.createdAt).toBeDefined();
            expect(comment.userId).toBe(normalUserPublicId);
            expect(comment.author).not.toBeNull();
            expect(comment.author?.id).toBe(normalUserPublicId);
            expect(comment.author?.fullName).toBeDefined();
        });

        it("editor and super admin can approve comment via PATCH /comments/:id/approve; normal user cannot", async () => {
            const { postId } = await createPostAs(superAdminToken);
            const createRes = await supertest(app)
                .post(`${blogPath}/comments`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send({ post_id: postId, content: "To approve via API." })
                .expect(201);
            const commentId = createRes.body.data.id;

            await supertest(app)
                .patch(`${blogPath}/comments/${commentId}/approve`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .expect(403);

            await supertest(app)
                .patch(`${blogPath}/comments/${commentId}/approve`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);

            const commentsRes = await supertest(app)
                .get(`${blogPath}/posts/${postId}/comments`)
                .expect(200);
            expect(commentsRes.body.data).toHaveLength(1);
            expect(commentsRes.body.data[0].id).toBe(commentId);
            expect(commentsRes.body.data[0].isApproved).toBe(true);
        });
    });

    describe("Admin posts RBAC", () => {
        it("editor and super admin can query admin posts; normal user and unauthenticated cannot", async () => {
            await supertest(app)
                .get(`${blogPath}/admin/posts`)
                .set("Authorization", `Bearer ${editorToken}`)
                .query({ limit: 5 })
                .expect(200);
            await supertest(app)
                .get(`${blogPath}/admin/posts`)
                .set("Authorization", `Bearer ${superAdminToken}`)
                .query({ limit: 5 })
                .expect(200);
            await supertest(app)
                .get(`${blogPath}/admin/posts`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .query({ limit: 5 })
                .expect(403);
            await supertest(app).get(`${blogPath}/admin/posts`).query({ limit: 5 }).expect(401);
        });

        it("admin posts query includes created posts and count", async () => {
            const { postId: id1 } = await createPostAs(editorToken, { title: `Editor-1-${Date.now()}` });
            const { postId: id2 } = await createPostAs(editorToken, { title: `Editor-2-${Date.now()}` });

            const res = await supertest(app)
                .get(`${blogPath}/admin/posts`)
                .set("Authorization", `Bearer ${editorToken}`)
                .query({ limit: 50 })
                .expect(200);
            expect(res.body.data.countResult).toBeGreaterThanOrEqual(2);
            const posts = res.body.data.postsResult as Array<{ id: string }>;
            expect(posts.some((p) => p.id === id1)).toBe(true);
            expect(posts.some((p) => p.id === id2)).toBe(true);
        });
    });

    describe("Admin comments RBAC", () => {
        it("editor and super admin can query admin comments; normal user and unauthenticated cannot", async () => {
            await supertest(app)
                .get(`${blogPath}/admin/comments`)
                .set("Authorization", `Bearer ${editorToken}`)
                .query({ limit: 5 })
                .expect(200);
            await supertest(app)
                .get(`${blogPath}/admin/comments`)
                .set("Authorization", `Bearer ${superAdminToken}`)
                .query({ limit: 5 })
                .expect(200);
            await supertest(app)
                .get(`${blogPath}/admin/comments`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .query({ limit: 5 })
                .expect(403);
            await supertest(app).get(`${blogPath}/admin/comments`).query({ limit: 5 }).expect(401);
        });
    });

    describe("Post activity tracking", () => {
        it("tracks view, like, share with optional auth and rejects invalid payloads", async () => {
            const { postId } = await createPostAs(editorToken);

            await supertest(app)
                .put(`${blogPath}/posts/${postId}/activity`)
                .send({ activity_type: "view" })
                .expect(200);

            await supertest(app)
                .put(`${blogPath}/posts/${postId}/activity`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send({ activity_type: "like" })
                .expect(200);

            await supertest(app)
                .put(`${blogPath}/posts/${postId}/activity`)
                .set("Authorization", `Bearer ${editorToken}`)
                .send({ activity_type: "share" })
                .expect(200);

            await supertest(app)
                .put(`${blogPath}/posts/${postId}/activity`)
                .send({ activity_type: "invalid" })
                .expect(400);

            await supertest(app)
                .put(`${blogPath}/posts/${postId}/activity`)
                .send({})
                .expect(400);
        });
    });

    /**
     * Integrated scenario: create content (post, comment, activity), then verify admin queries reflect it
     * and that a normal user cannot access admin endpoints. Asserts on actual result data and counts.
     */
    describe("Admin views reflect created content and enforce RBAC", () => {
        it("created post and comment appear in admin results; tracked activity appears in admin activities; normal user gets 403 on admin endpoints", async () => {
            const { postId } = await createPostAs(editorToken, { title: `AdminList-${Date.now()}` });
            const slugRes = await supertest(app)
                .get(`${blogPath}/posts/${postId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            const slug = slugRes.body.data.slug;

            const commentRes = await supertest(app)
                .post(`${blogPath}/comments`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                    .send({ post_id: postId, content: "Comment for admin view." })
                .expect(201);
            const commentId = commentRes.body.data.id;

            await supertest(app)
                .put(`${blogPath}/posts/${postId}/activity`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send({ activity_type: "like" })
                .expect(200);

            const adminPostsRes = await supertest(app)
                .get(`${blogPath}/admin/posts`)
                .set("Authorization", `Bearer ${editorToken}`)
                .query({ limit: 50 })
                .expect(200);
            const postIds = (adminPostsRes.body.data.postsResult as Array<{ id: string }>).map((p) => p.id);
            expect(postIds).toContain(postId);
            expect(adminPostsRes.body.data.countResult).toBeGreaterThanOrEqual(1);

            const adminCommentsRes = await supertest(app)
                .get(`${blogPath}/admin/comments`)
                .set("Authorization", `Bearer ${editorToken}`)
                .query({ limit: 50 })
                .expect(200);
            const commentIds = (adminCommentsRes.body.data.commentsResult as Array<{ id: string }>).map((c) => c.id);
            expect(commentIds).toContain(commentId);

            const adminActivitiesRes = await supertest(app)
                .get(`${blogPath}/admin/activities`)
                .set("Authorization", `Bearer ${editorToken}`)
                .query({ limit: 50 })
                .expect(200);
            const activities = adminActivitiesRes.body.data.activitiesResult as Array<{ postId: string; activityType: string }>;
            const commentActivity = activities.find((a) => a.postId === postId && a.activityType === "comment");
            const likeActivity = activities.find((a) => a.postId === postId && a.activityType === "like");
            expect(commentActivity).toBeDefined();
            expect(likeActivity).toBeDefined();

            await supertest(app)
                .get(`${blogPath}/admin/posts`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .query({ limit: 5 })
                .expect(403);
            await supertest(app)
                .get(`${blogPath}/admin/comments`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .query({ limit: 5 })
                .expect(403);
            await supertest(app)
                .get(`${blogPath}/admin/activities`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .query({ limit: 5 })
                .expect(403);
        });
    });

    /**
     * Integrated scenario: full post lifecycle — create (published), view by id and by slug,
     * then delete (with RBAC), then verify post is gone and slug returns 404.
     */
    describe("Post lifecycle: create, view by id and slug, delete, then not found", () => {
        it("editor creates published post; owner and super admin can read by id; public can read by slug; normal user cannot read by id; after editor deletes post, GET by id and by slug return 404", async () => {
            const { postId } = await createPostAs(superAdminToken, { title: `Lifecycle-${Date.now()}` });
            const byIdRes = await supertest(app)
                .get(`${blogPath}/posts/${postId}`)
                .set("Authorization", `Bearer ${superAdminToken}`)
                .expect(200);
            expect(byIdRes.body.data.id).toBe(postId);
            const slug = byIdRes.body.data.slug;

            await supertest(app).get(`${blogPath}/posts/${slug}`).expect(200);

            const { postId: editorPostId } = await createPostAs(editorToken);
            const ownerRes = await supertest(app)
                .get(`${blogPath}/posts/${editorPostId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            expect(ownerRes.body.data.userId).toBe(editorPublicId);

            await supertest(app)
                .get(`${blogPath}/posts/${editorPostId}`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .expect(403);
            await supertest(app).get(`${blogPath}/posts/${editorPostId}`).expect(401);

            await supertest(app)
                .delete(`${blogPath}/posts/${editorPostId}`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .expect(403);
            await supertest(app).delete(`${blogPath}/posts/${editorPostId}`).expect(401);
            await supertest(app)
                .delete(`${blogPath}/posts/${editorPostId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);

            await supertest(app)
                .get(`${blogPath}/posts/${editorPostId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(404);

            await supertest(app).delete(`${blogPath}/posts/${postId}`).set("Authorization", `Bearer ${superAdminToken}`).expect(200);
            await supertest(app).get(`${blogPath}/posts/${slug}`).expect(404);
            await supertest(app).get(`${blogPath}/posts/non-existent-slug-12345`).expect(404);
        });

        it("draft post is readable by owner by id but not by slug (public)", async () => {
            const { postId } = await createPostAs(editorToken);
            const draftRes = await supertest(app)
                .get(`${blogPath}/posts/${postId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            const slug = draftRes.body.data.slug;
            await supertest(app).get(`${blogPath}/posts/${slug}`).expect(404);
        });
    });

    /**
     * Integrated scenario: topic constraints — delete only when no posts and no children;
     * topic in use returns 400.
     */
    describe("Topic lifecycle and delete constraints", () => {
        it("editor can delete topic with no posts and no children; cannot delete topic that a post uses (400); list consistency", async () => {
            const topicRes = await supertest(app)
                .post(`${blogPath}/topics`)
                .set("Authorization", `Bearer ${editorToken}`)
                .send(topicCreateBody())
                .expect(201);
            const unusedTopicId = topicRes.body.data.id;
            blogHelper.trackTopic(unusedTopicId);

            const { postId } = await createPostAs(editorToken);
            const postRes = await supertest(app)
                .get(`${blogPath}/posts/${postId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            const topicInUseId = postRes.body.data.topicId;

            await supertest(app)
                .delete(`${blogPath}/topics/${topicInUseId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(400);

            await supertest(app)
                .delete(`${blogPath}/topics/${unusedTopicId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
        });
    });

    /**
     * Integrated scenario: comment lifecycle — create (unapproved), approve, public list shows it;
     * editor deletes comment, public list no longer shows it; normal user cannot delete.
     */
    describe("Comment lifecycle: create, approve, delete, public list consistency", () => {
        it("normal user adds comment; public GET comments shows 0 until editor approves; editor deletes comment; public list shows 0; normal user cannot delete", async () => {
            const { postId } = await createPostAs(editorToken);
            const createRes = await supertest(app)
                .post(`${blogPath}/comments`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send({ post_id: postId, content: "To approve then delete." })
                .expect(201);
            const commentId = createRes.body.data.id;

            const beforeApprove = await supertest(app).get(`${blogPath}/posts/${postId}/comments`).expect(200);
            expect(beforeApprove.body.data).toHaveLength(0);

            await supertest(app)
                .patch(`${blogPath}/comments/${commentId}/approve`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            const afterApprove = await supertest(app).get(`${blogPath}/posts/${postId}/comments`).expect(200);
            expect(afterApprove.body.data).toHaveLength(1);
            expect(afterApprove.body.data[0].id).toBe(commentId);

            await supertest(app)
                .delete(`${blogPath}/comments/${commentId}`)
                .set("Authorization", `Bearer ${normalUserToken}`)
                .expect(403);
            await supertest(app)
                .delete(`${blogPath}/comments/${commentId}`)
                .set("Authorization", `Bearer ${editorToken}`)
                .expect(200);
            const afterDelete = await supertest(app).get(`${blogPath}/posts/${postId}/comments`).expect(200);
            expect(afterDelete.body.data.filter((c: { id: string }) => c.id === commentId)).toHaveLength(0);
        });
    });
});
