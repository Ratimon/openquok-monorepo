/**
 * Abort a direct-to-storage multipart upload ({@link routes/publicApi/MediaUploadRoutes.ts}).
 *
 * @openapi
 * /public/upload/abort-multipart:
 *   post:
 *     operationId: postPublicUploadAbortMultipart
 *     tags:
 *       - Uploads
 *     summary: Abort a direct-to-storage multipart upload (API key)
 *     description: >-
 *       Cancels an in-flight multipart upload and discards uploaded parts.
 *       Call this when a part PUT fails and you will not retry the same
 *       `uploadId`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, uploadId]
 *             properties:
 *               key:
 *                 type: string
 *                 description: Object key from create-multipart.
 *               uploadId:
 *                 type: string
 *                 description: Multipart upload id from create-multipart.
 *           example:
 *             key: k9j8h7g6f5e4d3c2b1a0.mp4
 *             uploadId: '2~abc123'
 *     responses:
 *       '200':
 *         description: Multipart upload aborted.
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
 *                   required: [key, uploadId]
 *                   properties:
 *                     key:
 *                       type: string
 *                     uploadId:
 *                       type: string
 *             example:
 *               success: true
 *               message: Multipart upload aborted
 *               data:
 *                 key: k9j8h7g6f5e4d3c2b1a0.mp4
 *                 uploadId: '2~abc123'
 *       '400':
 *         description: Missing key or uploadId.
 *       '401':
 *         description: Missing or invalid API key.
 *       '501':
 *         description: This deployment does not support direct-to-storage multipart.
 */
export {};
