/**
 * Platform analytics for a connected channel ({@link routes/publicApi/AnalyticsRoutes.ts}).
 *
 * Returns platform-native time-series metrics (followers, impressions, etc.)
 * for the requested window (7 / 30 / 90 days). Results are cached per
 * `(organizationId, integrationId, date)` triple.
 * Backed by {@link services/AnalyticsService.getIntegrationAnalyticsProgrammatic}.
 *
 * @openapi
 * /public/analytics/{integrationId}:
 *   get:
 *     operationId: getPublicIntegrationAnalytics
 *     tags:
 *       - Analytics
 *     summary: Platform analytics (API key)
 *     description: >-
 *       Platform-native series for the channel. The response shape mirrors
 *       what the provider exposes — each series has a label and an array of
 *       `{ total, date }` points. Non-social or unsupported integrations
 *       return an empty array.
 *     parameters:
 *       - in: path
 *         name: integrationId
 *         required: true
 *         description: Integration channel UUID (from `GET /public/integrations`).
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
 *         description: Provider analytics for the window.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required: [label, data]
 *                     properties:
 *                       label:
 *                         type: string
 *                       data:
 *                         type: array
 *                         items:
 *                           type: object
 *                           required: [total, date]
 *                           properties:
 *                             total:
 *                               type: number
 *                             date:
 *                               type: string
 *             example:
 *               success: true
 *               data:
 *                 - label: Followers
 *                   data:
 *                     - total: 1234
 *                       date: '2026-05-05'
 *                     - total: 1240
 *                       date: '2026-05-06'
 *       '400':
 *         description: Invalid `integrationId` or `date` window.
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Integration not found in this workspace.
 */
export {};
