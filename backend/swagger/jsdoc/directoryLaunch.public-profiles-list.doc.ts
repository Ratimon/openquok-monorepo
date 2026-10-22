/**
 * List product profiles ({@link routes/publicApi/DirectoryLaunchRoutes.ts}).
 *
 * @openapi
 * /public/directory-launch/profiles:
 *   get:
 *     operationId: getPublicDirectoryLaunchProfiles
 *     tags:
 *       - DirectoryLaunch
 *     summary: List product profiles (API key)
 *     description: >-
 *       Lists main and variant product profiles for the API key workspace. Pass
 *       `integrationCustomerId` to filter profiles linked to a channel group.
 *     parameters:
 *       - in: query
 *         name: integrationCustomerId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Channel group id (`integration_customers.id`).
 *     responses:
 *       '200':
 *         description: Product profiles for this workspace.
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
 *                     required: [id, organizationId, name, profileData, profileKind, createdAt, updatedAt]
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       organizationId:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       profileKind:
 *                         type: string
 *                         enum: [main, variant]
 *                       directorySiteKey:
 *                         type: string
 *                         nullable: true
 *                       similarityToMainPercent:
 *                         type: number
 *                         nullable: true
 *             example:
 *               success: true
 *               data:
 *                 - id: 2a8b5c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d
 *                   organizationId: 3b9c6d2e-5f60-7b8c-9d0e-1f2a3b4c5d6e
 *                   integrationCustomerId: null
 *                   name: Acme SaaS
 *                   tagline: Ship faster
 *                   description: null
 *                   websiteUrl: https://acme.example
 *                   logoUrl: null
 *                   profileData: {}
 *                   profileKind: main
 *                   parentProfileId: null
 *                   directorySiteKey: null
 *                   similarityToMainPercent: null
 *                   createdAt: '2026-10-01T12:00:00.000Z'
 *                   updatedAt: '2026-10-01T12:00:00.000Z'
 *       '400':
 *         description: Invalid query parameters.
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory launch is not enabled on this workspace plan.
 */
export {};
