/**
 * Find next free schedule slot ({@link routes/publicApi/PostRoutes.ts}).
 *
 * Walks the organization's `posting_times` day-by-day and returns the first
 * candidate that is in the future and not already taken by an existing post.
 * Falls back to "now" when no posting times are configured.
 * Backed by {@link services/PostsService.findFreeSlotProgrammatic}.
 *
 * @openapi
 * /public/posts/find-slot/{integrationId}:
 *   get:
 *     operationId: findPublicPostSlot
 *     tags:
 *       - Posts
 *     summary: Find next free schedule slot (API key)
 *     description: >-
 *       Suggests the next available ISO timestamp for scheduling using the
 *       supplied channel's `posting_times`. Calling `GET /public/posts/find-slot`
 *       (without the `{integrationId}` segment) is also accepted and considers
 *       every connected channel in the workspace.
 *     parameters:
 *       - in: path
 *         name: integrationId
 *         required: true
 *         description: Integration UUID whose `posting_times` should be used.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: First free schedule slot for the organization.
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
 *                   required: [date]
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       description: ISO timestamp of the suggested slot (UTC).
 *             example:
 *               success: true
 *               data:
 *                 date: '2026-05-12T17:00:00.000Z'
 *       '401':
 *         description: Missing or invalid API key.
 */
export {};
