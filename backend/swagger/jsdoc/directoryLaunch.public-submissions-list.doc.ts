/**
 * List directory submissions ({@link routes/publicApi/DirectoryLaunchRoutes.ts}).
 *
 * @openapi
 * /public/directory-launch/submissions:
 *   get:
 *     operationId: getPublicDirectoryLaunchSubmissions
 *     tags:
 *       - DirectoryLaunch
 *     summary: List submissions (API key, read-only)
 *     description: >-
 *       Export live listing URLs and submission status for client portals or reports. Read-only;
 *       filter by `productProfileId` and/or `destinationId`.
 *     parameters:
 *       - in: query
 *         name: productProfileId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: destinationId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Submission rows.
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
 *                     required:
 *                       - id
 *                       - organizationId
 *                       - productProfileId
 *                       - destinationId
 *                       - status
 *                       - syncStatus
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       organizationId:
 *                         type: string
 *                         format: uuid
 *                       productProfileId:
 *                         type: string
 *                         format: uuid
 *                       destinationId:
 *                         type: string
 *                         format: uuid
 *                       status:
 *                         type: string
 *                       listingUrl:
 *                         type: string
 *                         nullable: true
 *                       listingDofollow:
 *                         type: boolean
 *                       syncStatus:
 *                         type: string
 *                         enum: [pending, synced, stale]
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *             example:
 *               success: true
 *               data:
 *                 - id: 5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a
 *                   organizationId: 3b9c6d2e-5f60-7b8c-9d0e-1f2a3b4c5d6e
 *                   productProfileId: 2a8b5c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d
 *                   destinationId: 8f1a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *                   status: completed
 *                   listingUrl: https://peerpush.com/product/acme
 *                   listingDofollow: true
 *                   syncStatus: synced
 *                   completedAt: '2026-10-10T14:00:00.000Z'
 *       '400':
 *         description: Invalid query parameters.
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory launch is not enabled on this workspace plan.
 */
export {};
