/**
 * Get or delete a single post row by id ({@link routes/publicApi/PostRoutes.ts}).
 *
 * - **GET** — {@link services/PostsService.getPostSummaryProgrammatic} returns the row id and parent `postGroup`.
 * - **DELETE** — looks up `post_group` and forwards to
 *   {@link services/PostsService.deletePostGroup} (the whole group is soft-deleted).
 *
 * @openapi
 * /public/posts/{postId}:
 *   get:
 *     operationId: getPublicPostByIdSummary
 *     tags:
 *       - Posts
 *     summary: Get post row summary (API key)
 *     description: >-
 *       Resolves a calendar row UUID to its parent `postGroup` UUID. Use this to
 *       correlate list rows with the group id shown in the workspace. For
 *       `draft` ↔ `scheduled` toggles via API key, call `PUT /public/posts/{postId}/status`
 *       with the same row id instead of session-only group routes.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post row UUID.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Row id and parent post group.
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
 *                   required: [id, postGroup]
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     postGroup:
 *                       type: string
 *                       format: uuid
 *             example:
 *               success: true
 *               data:
 *                 id: 5b6c7d8e-9f01-2a3b-4c5d-6e7f8a9b0c1d
 *                 postGroup: 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Post not found in this workspace.
 *   delete:
 *     operationId: deletePublicPostById
 *     tags:
 *       - Posts
 *     summary: Delete a post by id (API key)
 *     description: >-
 *       Soft-deletes the post group that the row belongs to. Already-published
 *       rows remain on the connected social account; only OpenQuok records are
 *       removed so they no longer appear in `GET /public/posts/list` or repeat.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post row UUID.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Post group deleted.
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
 *                   required: [postId, postGroup]
 *                   properties:
 *                     postId:
 *                       type: string
 *                       format: uuid
 *                       description: The row id passed in the path (same id from `GET /public/posts/list`).
 *                     postGroup:
 *                       type: string
 *                       format: uuid
 *                       description: Parent post group that was soft-deleted.
 *             example:
 *               success: true
 *               data:
 *                 postId: 5b6c7d8e-9f01-2a3b-4c5d-6e7f8a9b0c1d
 *                 postGroup: 3c6b87f4-90b6-4a8a-9d8e-1bf6dca10aef
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Post not found in this workspace.
 */
export {};
