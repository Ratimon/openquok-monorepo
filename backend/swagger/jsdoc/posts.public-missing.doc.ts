/**
 * Candidate published assets when `release_id = "missing"` ({@link routes/publicApi/PostRoutes.ts}).
 *
 * For posts where the scheduled-publish worker could not map the live
 * network object back to the OpenQuok row, providers can expose a list
 * of recently published items so the operator can pick the matching one.
 * Backed by {@link services/PostsService.getMissingPublishCandidatesProgrammatic}.
 *
 * @openapi
 * /public/posts/{postId}/missing:
 *   get:
 *     operationId: getPublicPostMissingCandidates
 *     tags:
 *       - Posts
 *     summary: List missing-publish candidates (API key)
 *     description: >-
 *       Returns provider-side candidate IDs and preview URLs that may match
 *       this post. Only meaningful when the row has `release_id === "missing"`.
 *       Empty array otherwise.
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
 *         description: Candidate items.
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
 *                   required: [items]
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required: [id, url]
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Platform-native id (e.g. Threads media id).
 *                           url:
 *                             type: string
 *                             description: Preview URL of the published asset.
 *             example:
 *               success: true
 *               data:
 *                 items:
 *                   - id: '18000000000000001'
 *                     url: 'https://www.threads.net/@openquok.demo/post/abc'
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Post not found in this workspace.
 */
export {};
