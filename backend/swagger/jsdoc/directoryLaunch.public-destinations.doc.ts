/**
 * Published directory launch destinations ({@link routes/publicApi/DirectoryLaunchRoutes.ts}).
 *
 * @openapi
 * /public/directory-launch/destinations:
 *   get:
 *     operationId: getPublicDirectoryLaunchDestinations
 *     tags:
 *       - DirectoryLaunch
 *     summary: List published launch destinations (API key)
 *     description: >-
 *       Returns every published directory launch destination in the catalog, including
 *       `providerSlug`, `startUrl`, and `extensionConfig` fill steps. Requires a workspace
 *       plan with directory launch enabled (`directory_launch_enabled`).
 *     responses:
 *       '200':
 *         description: Published destinations.
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
 *                     required: [id, providerSlug, name, submissionPath, startUrl, sortOrder, extensionConfig]
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       providerSlug:
 *                         type: string
 *                       name:
 *                         type: string
 *                       shortDescription:
 *                         type: string
 *                         nullable: true
 *                       submissionPath:
 *                         type: string
 *                         enum: [extension, auto]
 *                       startUrl:
 *                         type: string
 *                         format: uri
 *                       sortOrder:
 *                         type: integer
 *                       opportunityDofollow:
 *                         type: string
 *                         nullable: true
 *                         enum: [dofollow, nofollow, unknown]
 *                       opportunityCostTier:
 *                         type: string
 *                         nullable: true
 *                         enum: [free, freemium, paid]
 *                       extensionConfig:
 *                         type: object
 *             example:
 *               success: true
 *               data:
 *                 - id: 8f1a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *                   providerSlug: peerpush-standard-launch
 *                   name: PeerPush Standard Launch
 *                   shortDescription: Paid standard listing on PeerPush.
 *                   submissionPath: extension
 *                   startUrl: https://peerpush.com/submit
 *                   sortOrder: 10
 *                   opportunityDofollow: dofollow
 *                   opportunityCostTier: paid
 *                   extensionConfig:
 *                     version: 1
 *                     steps: []
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory launch is not enabled on this workspace plan.
 */
export {};
