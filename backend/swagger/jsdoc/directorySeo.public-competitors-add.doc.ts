/**
 * Add directory SEO competitor ({@link routes/publicApi/DirectorySeoRoutes.ts}).
 *
 * @openapi
 * /public/directory-seo/workspace/competitors:
 *   post:
 *     operationId: postPublicDirectorySeoCompetitor
 *     tags:
 *       - DirectorySeo
 *     summary: Add a competitor domain (API key)
 *     description: >-
 *       Start benchmarking a rival domain next to a product profile. Subject to plan competitor quota.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [domain]
 *             properties:
 *               domain:
 *                 type: string
 *                 maxLength: 253
 *               label:
 *                 type: string
 *                 maxLength: 200
 *                 nullable: true
 *               sortOrder:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10000
 *           example:
 *             domain: rival.example
 *             label: Rival Co
 *     responses:
 *       '201':
 *         description: Competitor added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data, message]
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     domain:
 *                       type: string
 *                     label:
 *                       type: string
 *                       nullable: true
 *                     sortOrder:
 *                       type: integer
 *             example:
 *               success: true
 *               message: Competitor added
 *               data:
 *                 domain: rival.example
 *                 label: Rival Co
 *                 sortOrder: 0
 *                 domainRating: null
 *                 checkedAt: null
 *       '400':
 *         description: Invalid body or quota exceeded.
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory SEO is not enabled on this workspace plan.
 */
export {};
