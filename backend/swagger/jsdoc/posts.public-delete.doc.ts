/**
 * Delete a single post by id ({@link routes/publicApi/PostRoutes.ts}).
 *
 * Looks up the post row's `post_group` and forwards to
 * {@link services/PostsService.deletePostGroupProgrammatic}, so the entire
 * group is soft-deleted (a row never publishes in isolation).
 *
 * @openapi
 * /public/posts/{postId}:
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
 *                   required: [postGroup]
 *                   properties:
 *                     postGroup:
 *                       type: string
 *                       format: uuid
 *             example:
 *               success: true
 *               data:
 *                 postGroup: 3c6b87f4-90b6-4a8a-9d8e-1bf6dca10aef
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Post not found in this workspace.
 */
export {};
