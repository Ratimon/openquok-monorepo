/**
 * Remove directory SEO competitor ({@link routes/publicApi/DirectorySeoRoutes.ts}).
 *
 * @openapi
 * /public/directory-seo/workspace/competitors:
 *   delete:
 *     operationId: deletePublicDirectorySeoCompetitor
 *     tags:
 *       - DirectorySeo
 *     summary: Remove a competitor domain (API key)
 *     description: >-
 *       Stop tracking a rival domain when it is no longer relevant. Frees chart space and
 *       competitor quota.
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
 *           example:
 *             domain: rival.example
 *     responses:
 *       '200':
 *         description: Competitor removed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, message]
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               message: Competitor removed
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
