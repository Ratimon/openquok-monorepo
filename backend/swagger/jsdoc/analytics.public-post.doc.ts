/**
 * Platform-native insights for one published post ({@link routes/publicApi/AnalyticsRoutes.ts}).
 *
 * Returns the published row's metric series for the requested window
 * (7 / 30 / 90 days). If the worker could not link this OpenQuok row to a
 * provider object (`release_id === "missing"`), the response is
 * `data: { missing: true }` so callers can call
 * `GET /public/posts/{postId}/missing` and then `PUT /public/posts/{postId}/release-id`.
 * Backed by {@link services/PostsService.checkPostAnalyticsProgrammatic}.
 *
 * @openapi
 * /public/analytics/post/{postId}:
 *   get:
 *     operationId: getPublicPostAnalytics
 *     tags:
 *       - Analytics
 *     summary: Per-post analytics (API key)
 *     description: >-
 *       Platform-native metrics for the post row. Returns an empty array for
 *       unsupported providers or unpublished rows, and `data: { missing: true }`
 *       when the worker could not link the OpenQuok row to a live provider object.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post row UUID.
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: date
 *         required: true
 *         description: Window in days (7, 30, or 90).
 *         schema:
 *           type: string
 *           enum: ['7', '30', '90']
 *     responses:
 *       '200':
 *         description: Post analytics for the window (or missing-link envelope).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         type: object
 *                         required: [label, data]
 *                         properties:
 *                           label:
 *                             type: string
 *                           data:
 *                             type: array
 *                             items:
 *                               type: object
 *                               required: [total, date]
 *                               properties:
 *                                 total:
 *                                   type: number
 *                                 date:
 *                                   type: string
 *                     - type: object
 *                       required: [missing]
 *                       properties:
 *                         missing:
 *                           type: boolean
 *             example:
 *               success: true
 *               data:
 *                 - label: Impressions
 *                   data:
 *                     - total: 5421
 *                       date: '2026-05-05'
 *                     - total: 6230
 *                       date: '2026-05-06'
 *       '400':
 *         description: Invalid `postId` or `date` window.
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Post not found in this workspace.
 */
export {};
