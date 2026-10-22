/**
 * Directory SEO manual refresh ({@link routes/publicApi/DirectorySeoRoutes.ts}).
 *
 * @openapi
 * /public/directory-seo/workspace/refresh:
 *   post:
 *     operationId: postPublicDirectorySeoWorkspaceRefresh
 *     tags:
 *       - DirectorySeo
 *     summary: Refresh directory SEO metrics (API key)
 *     description: >-
 *       Enqueues a manual refresh for the product profile workspace. Respect the cooldown returned
 *       as `manualRefreshAvailableAt` on overview responses unless `force` is true (operator-style bypass).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productProfileId]
 *             properties:
 *               productProfileId:
 *                 type: string
 *                 format: uuid
 *               force:
 *                 type: boolean
 *                 default: false
 *           example:
 *             productProfileId: 2a8b5c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d
 *     responses:
 *       '200':
 *         description: Refresh accepted or skipped (cooldown).
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
 *                   properties:
 *                     manualRefreshAvailableAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *             example:
 *               success: true
 *               data:
 *                 manualRefreshAvailableAt: '2026-10-21T09:00:00.000Z'
 *       '400':
 *         description: Invalid body.
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory SEO is not enabled on this workspace plan.
 */
export {};
