/**
 * Profile listing summary ({@link routes/publicApi/DirectoryLaunchRoutes.ts}).
 *
 * @openapi
 * /public/directory-launch/profiles/{id}/listing-summary:
 *   get:
 *     operationId: getPublicDirectoryLaunchListingSummary
 *     tags:
 *       - DirectoryLaunch
 *     summary: Listing summary for a profile (API key)
 *     description: >-
 *       Aggregated launch readiness per published destination: submission status, sync status,
 *       and missing profile fields required before extension handoff.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product profile id (main or variant).
 *     responses:
 *       '200':
 *         description: Listing summary.
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
 *                   required:
 *                     - profileId
 *                     - publishedDirectorySiteCount
 *                     - submittedDirectorySiteCount
 *                     - unsubmittedDirectorySiteCount
 *                     - destinations
 *                   properties:
 *                     profileId:
 *                       type: string
 *                       format: uuid
 *                     publishedDirectorySiteCount:
 *                       type: integer
 *                     submittedDirectorySiteCount:
 *                       type: integer
 *                     unsubmittedDirectorySiteCount:
 *                       type: integer
 *                     destinations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - destinationId
 *                           - providerSlug
 *                           - destinationName
 *                           - submissionStatus
 *                           - readiness
 *                         properties:
 *                           destinationId:
 *                             type: string
 *                             format: uuid
 *                           providerSlug:
 *                             type: string
 *                           destinationName:
 *                             type: string
 *                           submissionStatus:
 *                             type: string
 *                             enum: [none, completed, other]
 *                           syncStatus:
 *                             type: string
 *                             nullable: true
 *                             enum: [pending, synced, stale]
 *                           readiness:
 *                             type: object
 *                             required: [isReady, missingFields]
 *                             properties:
 *                               isReady:
 *                                 type: boolean
 *                               missingFields:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *             example:
 *               success: true
 *               data:
 *                 profileId: 2a8b5c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d
 *                 publishedDirectorySiteCount: 2
 *                 submittedDirectorySiteCount: 1
 *                 unsubmittedDirectorySiteCount: 1
 *                 destinations:
 *                   - destinationId: 8f1a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *                     providerSlug: peerpush-standard-launch
 *                     destinationName: PeerPush Standard Launch
 *                     submissionStatus: completed
 *                     syncStatus: synced
 *                     readiness:
 *                       isReady: true
 *                       missingFields: []
 *                   - destinationId: 9a2b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d
 *                     providerSlug: uneed-join-line
 *                     destinationName: Uneed Join the line
 *                     submissionStatus: none
 *                     syncStatus: null
 *                     readiness:
 *                       isReady: false
 *                       missingFields: [logoUrl]
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory launch is not enabled on this workspace plan.
 *       '404':
 *         description: Profile not found in this workspace.
 */
export {};
