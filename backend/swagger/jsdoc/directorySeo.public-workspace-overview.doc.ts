/**
 * Directory SEO workspace overview ({@link routes/publicApi/DirectorySeoRoutes.ts}).
 *
 * @openapi
 * /public/directory-seo/workspace/overview:
 *   get:
 *     operationId: getPublicDirectorySeoWorkspaceOverview
 *     tags:
 *       - DirectorySeo
 *     summary: Directory SEO overview (API key)
 *     description: >-
 *       Domain rating snapshot for the product profile primary domain plus tracked competitors.
 *       DR values are cached — read `checkedAt` on each metric row and `manualRefreshAvailableAt`
 *       on the envelope before calling refresh. Requires `directory_seo_enabled` on the plan.
 *     parameters:
 *       - in: query
 *         name: productProfileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Workspace SEO overview.
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
 *                   required: [competitors, providerConfigured, manualRefreshAvailableAt]
 *                   properties:
 *                     productDomain:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         domain:
 *                           type: string
 *                         domainRating:
 *                           type: number
 *                           nullable: true
 *                         checkedAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         delta7Days:
 *                           type: number
 *                           nullable: true
 *                         delta30Days:
 *                           type: number
 *                           nullable: true
 *                         delta90Days:
 *                           type: number
 *                           nullable: true
 *                     competitors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           domain:
 *                             type: string
 *                           label:
 *                             type: string
 *                             nullable: true
 *                           sortOrder:
 *                             type: integer
 *                           domainRating:
 *                             type: number
 *                             nullable: true
 *                           checkedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                     providerConfigured:
 *                       type: boolean
 *                     manualRefreshAvailableAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *             example:
 *               success: true
 *               data:
 *                 productDomain:
 *                   domain: acme.example
 *                   domainRating: 42
 *                   checkedAt: '2026-10-20T08:00:00.000Z'
 *                   delta7Days: 1.5
 *                   delta30Days: 3
 *                   delta90Days: 5
 *                 competitors:
 *                   - domain: rival.example
 *                     label: Rival Co
 *                     sortOrder: 0
 *                     domainRating: 38
 *                     checkedAt: '2026-10-20T08:00:00.000Z'
 *                 providerConfigured: true
 *                 manualRefreshAvailableAt: null
 *       '400':
 *         description: Invalid `productProfileId`.
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory SEO is not enabled on this workspace plan.
 */
export {};
