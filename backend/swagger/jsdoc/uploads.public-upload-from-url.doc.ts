/**
 * Upload media from a URL ({@link routes/publicApi/MediaUploadRoutes.ts}).
 *
 * Fetches the resource server-side, infers a mime type from the
 * `content-type` header (falling back to the URL extension), and stores
 * the bytes through the same uploader as `POST /public/upload`.
 * Backed by {@link controllers/MediaController.uploadProgrammaticFromUrl}.
 *
 * @openapi
 * /public/upload-from-url:
 *   post:
 *     operationId: postPublicUploadFromUrl
 *     tags:
 *       - Uploads
 *     summary: Upload media from a URL (API key)
 *     description: >-
 *       Server-side fetches the given http(s) URL, stores the bytes, and
 *       returns a `MediaUploadResponse` identical to `POST /public/upload`.
 *       Use the returned `id` and `filePath` as `media[]` items on
 *       `POST /public/posts`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: Public http(s) URL to fetch.
 *           example:
 *             url: 'https://example.com/banner.jpg'
 *     responses:
 *       '200':
 *         description: Media stored.
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
 *                       format: uuid
 *                       description: Media row id (use as `media[].id` on `POST /public/posts`).
 *                     filePath:
 *                       type: string
 *                       description: Storage object key (use as `media[].path`).
 *                     originalName:
 *                       type: string
 *                       description: Server-generated filename (e.g. `upload.jpg`).
 *                     publicUrl:
 *                       type: string
 *                       description: Optional public URL when the bucket exposes one.
 *             example:
 *               success: true
 *               message: Media uploaded successfully
 *               data:
 *                 id: '6f8a9b1c-2d3e-4f5a-9b8c-7d6e5f4a3b2c'
 *                 filePath: 'org_42/upload.jpg'
 *                 originalName: 'upload.jpg'
 *                 publicUrl: 'https://media.example.com/org_42/upload.jpg'
 *       '400':
 *         description: Missing/invalid URL or unsupported mime type.
 *       '401':
 *         description: Missing or invalid API key.
 */
export {};
