/**
 * Programmatic kanban review todo ({@link routes/publicApi/PostRoutes.ts}).
 *
 * @openapi
 * /public/posts/{postId}/review-todo:
 *   put:
 *     operationId: putPublicPostReviewTodo
 *     tags:
 *       - Posts
 *     summary: Update post review todo (API key)
 *     description: >-
 *       Update the kanban review note and/or `isReviewed` flag for the post group
 *       that contains `{postId}`. Pass `isAgent: true` from the CLI so rows stay
 *       flagged as agent-edited; the dashboard clears `isAgentEdited` on every update.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post row UUID (any row in the target group).
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 2000
 *               isReviewed:
 *                 type: boolean
 *               isAgent:
 *                 type: boolean
 *                 description: When true, sets `isAgentEdited` on the group (CLI/agent).
 *           example:
 *             note: Confirm tone and hashtags before publishing
 *             isReviewed: false
 *             isAgent: true
 *     responses:
 *       '200':
 *         description: Updated rows for the post group.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   required: [posts]
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SocialPostDTO'
 *             example:
 *               success: true
 *               data:
 *                 posts:
 *                   - id: 5b3c1d2e-9a3f-4e6b-bb12-2c0a5f1a90a1
 *                     state: DRAFT
 *                     publishDate: '2026-05-14T11:00:00.000Z'
 *                     organizationId: c1d8a3f4-1234-4abc-bf12-1234567890ab
 *                     integrationId: 1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *                     content: Hello
 *                     delay: 0
 *                     postGroup: 9a0a1b2c-3d4e-4f5a-9b8c-aa11bb22cc33
 *                     title: null
 *                     description: null
 *                     parentPostId: null
 *                     releaseId: null
 *                     releaseUrl: null
 *                     settings: null
 *                     image: null
 *                     intervalInDays: null
 *                     error: null
 *                     deletedAt: null
 *                     createdByUserId: null
 *                     note: Confirm tone and hashtags before publishing
 *                     isAgentEdited: true
 *                     isReviewed: false
 *                     createdAt: '2026-05-10T09:00:00.000Z'
 *                     updatedAt: '2026-05-10T10:00:00.000Z'
 *       '400':
 *         description: Validation error.
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Post not found in this workspace.
 */
export {};
