/**
 * Start a direct-to-storage multipart upload ({@link routes/publicApi/MediaUploadRoutes.ts}).
 *
 * Returns `uploadId` + `key`. PUT each part to a URL from
 * `POST /public/upload/sign-parts`, then finish with
 * `POST /public/upload/complete-multipart`.
 *
 * @openapi
 * /public/upload/create-multipart:
 *   post:
 *     operationId: postPublicUploadCreateMultipart
 *     tags:
 *       - Uploads
 *     summary: Start a direct-to-storage multipart upload (API key)
 *     description: >-
 *       Creates an object-storage multipart upload for one file. The request
 *       body is JSON only — bytes never pass through the API — so this path
 *       works for videos larger than the hosted ~4.5 MB inbound body limit.
 *       Requires object storage that supports multipart (R2). Local-disk
 *       deployments return 501; use `POST /public/upload` instead.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fileName]
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Original filename (used for extension and MIME inference).
 *               contentType:
 *                 type: string
 *                 description: MIME type. Inferred from `fileName` when omitted.
 *               fileSize:
 *                 type: integer
 *                 description: Optional byte length. Rejected early when above the per-type cap.
 *           example:
 *             fileName: clip.mp4
 *             contentType: video/mp4
 *             fileSize: 17900000
 *     responses:
 *       '200':
 *         description: Multipart session created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data, message]
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   required: [uploadId, key]
 *                   properties:
 *                     uploadId:
 *                       type: string
 *                       description: Storage multipart upload id (pass to sign-parts and complete).
 *                     key:
 *                       type: string
 *                       description: Object key that becomes `media[].path` after complete.
 *             example:
 *               success: true
 *               message: Multipart upload created
 *               data:
 *                 uploadId: '2~abc123'
 *                 key: k9j8h7g6f5e4d3c2b1a0.mp4
 *       '400':
 *         description: Missing fileName or unsupported mime type.
 *       '401':
 *         description: Missing or invalid API key.
 *       '501':
 *         description: This deployment does not support direct-to-storage multipart.
 */
export {};
