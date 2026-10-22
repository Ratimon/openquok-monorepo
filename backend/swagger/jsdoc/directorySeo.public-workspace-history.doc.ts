/**
 * Directory SEO history ({@link routes/publicApi/DirectorySeoRoutes.ts}).
 *
 * @openapi
 * /public/directory-seo/workspace/history:
 *   get:
 *     operationId: getPublicDirectorySeoWorkspaceHistory
 *     tags:
 *       - DirectorySeo
 *     summary: Directory SEO history (API key)
 *     description: >-
 *       Time series of domain rating points for the product domain and each tracked competitor.
 *       Pass `days` (default 90, max 366). Cached snapshots use `capturedAt` on each point.
 *     parameters:
 *       - in: query
 *         name: productProfileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: days
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 366
 *           default: 90
 *     responses:
 *       '200':
 *         description: History series.
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
 *                   required: [product, competitors]
 *                   properties:
 *                     product:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required: [capturedAt, domainRating]
 *                         properties:
 *                           capturedAt:
 *                             type: string
 *                             format: date-time
 *                           domainRating:
 *                             type: number
 *                             nullable: true
 *                     competitors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required: [domain, points]
 *                         properties:
 *                           domain:
 *                             type: string
 *                           label:
 *                             type: string
 *                             nullable: true
 *                           points:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 capturedAt:
 *                                   type: string
 *                                   format: date-time
 *                                 domainRating:
 *                                   type: number
 *                                   nullable: true
 *             example:
 *               success: true
 *               data:
 *                 product:
 *                   - capturedAt: '2026-10-01T00:00:00.000Z'
 *                     domainRating: 40
 *                   - capturedAt: '2026-10-20T00:00:00.000Z'
 *                     domainRating: 42
 *                 competitors:
 *                   - domain: rival.example
 *                     label: Rival Co
 *                     points:
 *                       - capturedAt: '2026-10-20T00:00:00.000Z'
 *                         domainRating: 38
 *       '400':
 *         description: Invalid query parameters.
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory SEO is not enabled on this workspace plan.
 */
export {};
