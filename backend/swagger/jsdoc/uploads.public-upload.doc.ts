/**
 * Programmatic media upload ({@link routes/publicApi/MediaUploadRoutes.ts}).
 *
 * Stores the file in the workspace's media bucket and persists a row in
 * `media`. The returned `id` + `path` are the values you pass back as
 * `media[].id` / `media[].path` when creating or updating a post.
 *
 * @openapi
 * /public/upload:
 *   post:
 *     operationId: postPublicUpload
 *     tags:
 *       - Uploads
 *     summary: Upload a media file (API key)
 *     description: >-
 *       Multipart upload of one media asset (field name `file`). Accepts
 *       images, video, audio, and PDF; mimetype is inferred from the filename
 *       when the multipart part omits it. The total upload size is capped at
 *       `MAX_MEDIA_UPLOAD_BYTES` (shared with the session uploader).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The media file (image / video / audio / PDF).
 *     responses:
 *       '200':
 *         description: Upload stored and a media row was persisted for the workspace.
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
 *                       description: Original filename from the multipart part.
 *                     publicUrl:
 *                       type: string
 *                       description: Canonical public URL for the asset when the storage backend exposes one.
 *             example:
 *               success: true
 *               message: Media uploaded successfully
 *               data:
 *                 id: 7e3a1d2e-9a3f-4e6b-bb12-2c0a5f1a90a1
 *                 filePath: c1d8a3f4-1234-4abc-bf12-1234567890ab/upload/photo.jpg
 *                 originalName: photo.jpg
 *                 publicUrl: https://uploads.example.com/c1d8a3f4-1234-4abc-bf12-1234567890ab/upload/photo.jpg
 *       '400':
 *         description: Missing file or unsupported mime type.
 *       '401':
 *         description: Missing or invalid API key.
 *       '413':
 *         description: File exceeds the workspace upload size cap.
 */
export {};
