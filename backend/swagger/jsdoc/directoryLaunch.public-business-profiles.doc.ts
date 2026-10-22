/**
 * Business profile picker rows ({@link routes/publicApi/DirectoryLaunchRoutes.ts}).
 *
 * @openapi
 * /public/directory-launch/business-profiles:
 *   get:
 *     operationId: getPublicDirectoryLaunchBusinessProfiles
 *     tags:
 *       - DirectoryLaunch
 *     summary: List business profile rows (API key)
 *     description: >-
 *       Returns channel-group ↔ product profile rows for the organization bound to the API key.
 *       Use `integrationCustomerId` and `productProfileId` when wiring profiles to channel groups.
 *     responses:
 *       '200':
 *         description: Business profile rows for this workspace.
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
 *                     required: [integrationCustomerId, productProfileId, name]
 *                     properties:
 *                       integrationCustomerId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       productProfileId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       name:
 *                         type: string
 *                       tagline:
 *                         type: string
 *                         nullable: true
 *                       websiteUrl:
 *                         type: string
 *                         nullable: true
 *                       logoUrl:
 *                         type: string
 *                         nullable: true
 *             example:
 *               success: true
 *               data:
 *                 - integrationCustomerId: 1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *                   productProfileId: 2a8b5c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d
 *                   name: Acme SaaS
 *                   tagline: Ship faster
 *                   websiteUrl: https://acme.example
 *                   logoUrl: null
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory launch is not enabled on this workspace plan.
 */
export {};
