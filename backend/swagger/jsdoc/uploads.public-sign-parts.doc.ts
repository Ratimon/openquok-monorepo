/**
 * Presign multipart parts ({@link routes/publicApi/MediaUploadRoutes.ts}).
 *
 * @openapi
 * /public/upload/sign-parts:
 *   post:
 *     operationId: postPublicUploadSignParts
 *     tags:
 *       - Uploads
 *     summary: Presign multipart part URLs (API key)
 *     description: >-
 *       Returns one PUT URL per part number. Upload each slice directly to
 *       object storage (minimum 5 MiB per part except the last). Keep the
 *       `ETag` from each PUT response for `POST /public/upload/complete-multipart`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, uploadId, partNumbers]
 *             properties:
 *               key:
 *                 type: string
 *                 description: Object key from create-multipart.
 *               uploadId:
 *                 type: string
 *                 description: Multipart upload id from create-multipart.
 *               partNumbers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 description: One-based part numbers to sign (usually 1..N).
 *           example:
 *             key: k9j8h7g6f5e4d3c2b1a0.mp4
 *             uploadId: '2~abc123'
 *             partNumbers: [1, 2]
 *     responses:
 *       '200':
 *         description: Presigned PUT URLs keyed by part number.
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
 *                   required: [urls]
 *                   properties:
 *                     urls:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                       description: Map of part number (string) to a time-limited PUT URL.
 *             example:
 *               success: true
 *               message: Parts signed
 *               data:
 *                 urls:
 *                   '1': 'https://storage.example.com/part1?X-Amz-Signature=…'
 *                   '2': 'https://storage.example.com/part2?X-Amz-Signature=…'
 *       '400':
 *         description: Missing key, uploadId, or partNumbers.
 *       '401':
 *         description: Missing or invalid API key.
 *       '501':
 *         description: This deployment does not support direct-to-storage multipart.
 */
export {};
