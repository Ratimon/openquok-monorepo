/**
 * Create a main product profile ({@link routes/publicApi/DirectoryLaunchRoutes.ts}).
 *
 * @openapi
 * /public/directory-launch/profiles:
 *   post:
 *     operationId: postPublicDirectoryLaunchProfile
 *     tags:
 *       - DirectoryLaunch
 *     summary: Create a main product profile (API key)
 *     description: >-
 *       Add a new main product profile when your system already has listing copy. The organization
 *       is inferred from the API key — do not send `organizationId`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               integrationCustomerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
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
 *               profileData:
 *                 type: object
 *                 additionalProperties: true
 *           example:
 *             name: Acme SaaS
 *             tagline: Ship faster
 *             websiteUrl: https://acme.example
 *             profileData: {}
 *     responses:
 *       '201':
 *         description: Profile created.
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
 *                   required: [id, name, profileKind]
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     profileKind:
 *                       type: string
 *             example:
 *               success: true
 *               data:
 *                 id: 2a8b5c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d
 *                 name: Acme SaaS
 *                 profileKind: main
 *       '400':
 *         description: Invalid request body.
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory launch is not enabled on this workspace plan.
 */
export {};
