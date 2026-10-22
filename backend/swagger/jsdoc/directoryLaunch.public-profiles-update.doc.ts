/**
 * Update a product profile ({@link routes/publicApi/DirectoryLaunchRoutes.ts}).
 *
 * @openapi
 * /public/directory-launch/profiles/{id}:
 *   patch:
 *     operationId: patchPublicDirectoryLaunchProfile
 *     tags:
 *       - DirectoryLaunch
 *     summary: Update a product profile (API key)
 *     description: >-
 *       Partial update for a main or variant profile in the API key workspace. Send at least one field.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 200
 *               tagline:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *               websiteUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               logoUrl:
 *                 type: string
 *                 nullable: true
 *               integrationCustomerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               profileData:
 *                 type: object
 *                 additionalProperties: true
 *           example:
 *             tagline: Launch on every directory
 *             profileData:
 *               categories: [SaaS, Developer tools]
 *     responses:
 *       '200':
 *         description: Updated profile.
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
 *             example:
 *               success: true
 *               data:
 *                 id: 2a8b5c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d
 *                 name: Acme SaaS
 *                 tagline: Launch on every directory
 *                 profileKind: main
 *       '400':
 *         description: Invalid body or empty patch.
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory launch is not enabled on this workspace plan.
 *       '404':
 *         description: Profile not found in this workspace.
 */
export {};
