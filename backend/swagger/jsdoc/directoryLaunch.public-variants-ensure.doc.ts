/**
 * Idempotent directory variant ({@link routes/publicApi/DirectoryLaunchRoutes.ts}).
 *
 * @openapi
 * /public/directory-launch/profiles/{mainId}/variants:
 *   post:
 *     operationId: postPublicDirectoryLaunchVariantEnsure
 *     tags:
 *       - DirectoryLaunch
 *     summary: Ensure a directory variant (API key)
 *     description: >-
 *       Prepare per-directory pitch text without cloning the whole product. Idempotent: returns
 *       **200** when a variant for `directorySiteKey` already exists, **201** when created.
 *     parameters:
 *       - in: path
 *         name: mainId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Main product profile id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [directorySiteKey]
 *             properties:
 *               directorySiteKey:
 *                 type: string
 *                 description: Site slug (e.g. `peerpush`, `uneed`).
 *               name:
 *                 type: string
 *                 maxLength: 200
 *           example:
 *             directorySiteKey: peerpush
 *             name: Acme on PeerPush
 *     responses:
 *       '200':
 *         description: Existing variant returned.
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
 *                 id: 4c1d2e3f-5a6b-7c8d-9e0f-1a2b3c4d5e6f
 *                 profileKind: variant
 *                 parentProfileId: 2a8b5c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d
 *                 directorySiteKey: peerpush
 *                 similarityToMainPercent: 92
 *       '201':
 *         description: Variant created.
 *       '400':
 *         description: Invalid body or main profile id.
 *       '401':
 *         description: Missing or invalid API key.
 *       '403':
 *         description: Directory launch is not enabled on this workspace plan.
 *       '404':
 *         description: Main profile not found in this workspace.
 */
export {};
