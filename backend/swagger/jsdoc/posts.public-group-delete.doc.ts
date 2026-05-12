/**
 * Programmatic post-group delete ({@link routes/publicApi/PostRoutes.ts}).
 *
 * Soft-deletes every row in the group and detaches associated tags. Pending
 * worker jobs see the deleted state on next pickup and skip publishing.
 * Backed by {@link services/PostsService.deletePostGroupProgrammatic}.
 *
 * @openapi
 * /public/posts/group/{postGroup}:
 *   delete:
 *     operationId: deletePublicPostGroup
 *     tags:
 *       - Posts
 *     summary: Delete a post group (API key)
 *     description: >-
 *       Soft-deletes the group and detaches its tags. Already-published rows
 *       remain on the connected social account; only the OpenQuok records are
 *       removed so they no longer appear in `GET /public/posts/list` or repeat.
 *     parameters:
 *       - in: path
 *         name: postGroup
 *         required: true
 *         description: Post group UUID.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Post group deleted (or was already inactive).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success]
 *               properties:
 *                 success:
 *                   type: boolean
 *             example:
 *               success: true
 *       '400':
 *         description: Invalid post group id or workspace mismatch.
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Post group not found in this workspace.
 */
export {};
