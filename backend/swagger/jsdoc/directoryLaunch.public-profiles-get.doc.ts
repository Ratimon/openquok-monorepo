/**
 * Get one product profile ({@link routes/publicApi/DirectoryLaunchRoutes.ts}).
 *
 * @openapi
 * /public/directory-launch/profiles/{id}:
 *   get:
 *     operationId: getPublicDirectoryLaunchProfileById
 *     tags:
 *       - DirectoryLaunch
 *     summary: Get a product profile (API key)
 *     description: >-
 *       Load one product's listing copy and custom fields for an editor or handoff doc. Includes
 *       variant metadata and `similarityToMainPercent` when the row is a per-directory variant.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Product profile.
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
 *                   required: [id, organizationId, name, profileData, profileKind, createdAt, updatedAt]
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     organizationId:
 *                       type: string
 *                       format: uuid
 *                     integrationCustomerId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     name:
 *                       type: string
 *                     tagline:
 *                       type: string
 *                       nullable: true
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     websiteUrl:
 *                       type: string
 *                       nullable: true
 *                     logoUrl:
 *                       type: string
 *                       nullable: true
 *                     profileData:
 *                       type: object
 *                       additionalProperties: true
 *                     profileKind:
 *                       type: string
 *                       enum: [main, variant]
 *                     parentProfileId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     directorySiteKey:
 *                       type: string
 *                       nullable: true
 *                     similarityToMainPercent:
 *                       type: number
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *             example:
 *               success: true
 *               data:
 *                 id: 2a8b5c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d
 *                 organizationId: 3b9c6d2e-5f60-7b8c-9d0e-1f2a3b4c5d6e
 *                 integrationCustomerId: null
 *                 name: Acme SaaS
 *                 tagline: Ship faster
 *                 description: We help teams ship directory listings.
 *                 websiteUrl: https://acme.example
 *                 logoUrl: null
 *                 profileData:
 *                   categories: [SaaS]
 *                 profileKind: main
 *                 parentProfileId: null
 *                 directorySiteKey: null
 *                 similarityToMainPercent: null
 *                 createdAt: '2026-10-01T12:00:00.000Z'
 *                 updatedAt: '2026-10-15T09:30:00.000Z'
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory launch is not enabled on this workspace plan.
 *       '404':
 *         description: Profile not found in this workspace.
 */
export {};
