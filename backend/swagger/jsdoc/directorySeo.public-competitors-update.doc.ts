/**
 * Update directory SEO competitor ({@link routes/publicApi/DirectorySeoRoutes.ts}).
 *
 * @openapi
 * /public/directory-seo/workspace/competitors:
 *   patch:
 *     operationId: patchPublicDirectorySeoCompetitor
 *     tags:
 *       - DirectorySeo
 *     summary: Update a competitor label (API key)
 *     description: >-
 *       Change the display label for a tracked competitor in your UI. The measured domain stays
 *       the same.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [domain, label]
 *             properties:
 *               domain:
 *                 type: string
 *                 maxLength: 253
 *               label:
 *                 type: string
 *                 maxLength: 200
 *                 nullable: true
 *           example:
 *             domain: rival.example
 *             label: Rival Co (updated)
 *     responses:
 *       '200':
 *         description: Competitor updated.
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
 *             example:
 *               success: true
 *               message: Competitor updated
 *               data:
 *                 domain: rival.example
 *                 label: Rival Co (updated)
 *                 sortOrder: 0
 *       '400':
 *         description: Invalid body.
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory SEO is not enabled on this workspace plan.
 *       '404':
 *         description: Competitor not found.
 */
export {};
