/**
 * Complete a direct-to-storage multipart upload ({@link routes/publicApi/MediaUploadRoutes.ts}).
 *
 * @openapi
 * /public/upload/complete-multipart:
 *   post:
 *     operationId: postPublicUploadCompleteMultipart
 *     tags:
 *       - Uploads
 *     summary: Complete a direct-to-storage multipart upload (API key)
 *     description: >-
 *       Assembles the uploaded parts and persists a `media` row. The response
 *       envelope matches `POST /public/upload` — pass `data.id` as
 *       `media[].id` and `data.filePath` as `media[].path` on
 *       `POST /public/posts`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, uploadId, fileName, fileSize, parts]
 *             properties:
 *               key:
 *                 type: string
 *                 description: Object key from create-multipart.
 *               uploadId:
 *                 type: string
 *                 description: Multipart upload id from create-multipart.
 *               fileName:
 *                 type: string
 *                 description: Original filename stored on the media row.
 *               contentType:
 *                 type: string
 *                 description: MIME type. Inferred from `fileName` when omitted.
 *               fileSize:
 *                 type: integer
 *                 description: Total byte length of the assembled object.
 *               parts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [ETag, PartNumber]
 *                   properties:
 *                     ETag:
 *                       type: string
 *                       description: ETag header from the part PUT (quotes optional).
 *                     PartNumber:
 *                       type: integer
 *                       description: One-based part number.
 *           example:
 *             key: k9j8h7g6f5e4d3c2b1a0.mp4
 *             uploadId: '2~abc123'
 *             fileName: clip.mp4
 *             contentType: video/mp4
 *             fileSize: 17900000
 *             parts:
 *               - ETag: '"abc111"'
 *                 PartNumber: 1
 *               - ETag: '"abc222"'
 *                 PartNumber: 2
 *     responses:
 *       '200':
 *         description: Upload stored and a media row was persisted.
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
 *                   required: [id, filePath, originalName]
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Media row id (pass as `media[].id` to `POST /public/posts`).
 *                     filePath:
 *                       type: string
 *                       description: Storage object key (pass as `media[].path`).
 *                     originalName:
 *                       type: string
 *                       description: Original filename from the complete request.
 *                     publicUrl:
 *                       type: string
 *                       description: Canonical public URL when the storage backend exposes one.
 *             example:
 *               success: true
 *               message: Media uploaded successfully
 *               data:
 *                 id: 7e3a1d2e-9a3f-4e6b-bb12-2c0a5f1a90a1
 *                 filePath: k9j8h7g6f5e4d3c2b1a0.mp4
 *                 originalName: clip.mp4
 *                 publicUrl: https://uploads.example.com/k9j8h7g6f5e4d3c2b1a0.mp4
 *       '400':
 *         description: Missing fields, unsupported mime, or file over the workspace cap.
 *       '401':
 *         description: Missing or invalid API key.
 *       '501':
 *         description: This deployment does not support direct-to-storage multipart.
 */
export {};
