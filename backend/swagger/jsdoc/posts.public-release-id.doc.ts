/**
 * Link a published release id ({@link routes/publicApi/PostRoutes.ts}).
 *
 * When the worker could not map this row to a live provider object
 * (`release_id === "missing"`), this endpoint lets the operator manually
 * supply the provider id so analytics start tracking the published post.
 * Backed by {@link services/PostsService.updatePostReleaseIdProgrammatic}.
 *
 * @openapi
 * /public/posts/{postId}/release-id:
 *   put:
 *     operationId: updatePublicPostReleaseId
 *     tags:
 *       - Posts
 *     summary: Link a published release id (API key)
 *     description: >-
 *       Manually associates the OpenQuok post row with the platform-native id
 *       returned by the social platform (e.g. Threads media id, X tweet id).
 *       Only succeeds while the row still has `release_id === "missing"`.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post row UUID.
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [releaseId]
 *             properties:
 *               releaseId:
 *                 type: string
 *                 description: Platform-native id (non-empty). Picked from `GET /public/posts/{postId}/missing`.
 *           example:
 *             releaseId: '18000000000000001'
 *     responses:
 *       '200':
 *         description: Release id linked.
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
 *                   required: [id, releaseId]
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Post row UUID (same as path `postId`).
 *                     releaseId:
 *                       type: string
 *                       description: Linked platform-native id (trimmed from the request body).
 *             example:
 *               success: true
 *               data:
 *                 id: '5b3c1d2e-9a3f-4e6b-bb12-2c0a5f1a90a1'
 *                 releaseId: '18000000000000001'
 *       '400':
 *         description: releaseId missing, or row cannot be linked (already published).
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Post not found in this workspace.
 */
export {};
