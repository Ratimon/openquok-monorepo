/**
 * List paginated notifications for the organization ({@link routes/publicApi/NotificationRoutes.ts}).
 *
 * Returns 100 rows per page ordered newest first. Does not advance the
 * session "last read" cursor — that is a UI concern handled by
 * `GET /api/v1/notifications/list` for authenticated sessions.
 * Backed by {@link services/NotificationService.getNotificationsPaginatedProgrammatic}.
 *
 * @openapi
 * /public/notifications:
 *   get:
 *     operationId: getPublicNotifications
 *     tags:
 *       - Notifications
 *     summary: List notifications (API key)
 *     description: >-
 *       Paginated in-app notification history for the organization the API key
 *       belongs to. Page size is fixed at 100; pass `page=N` (zero-based) for
 *       older batches.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Zero-based page offset (default `0`).
 *         schema:
 *           type: string
 *           pattern: '^[0-9]+$'
 *     responses:
 *       '200':
 *         description: Paginated notifications batch.
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
 *                   required: [notifications, page, limit]
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required: [created_at, content]
 *                         properties:
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           content:
 *                             type: string
 *                     page:
 *                       type: integer
 *                       description: Echo of the requested page (zero-based).
 *                     limit:
 *                       type: integer
 *                       description: Fixed batch size (100).
 *             example:
 *               success: true
 *               data:
 *                 notifications:
 *                   - created_at: '2026-05-12T10:23:00.000Z'
 *                     content: 'Channel @openquok.demo published a post'
 *                 page: 0
 *                 limit: 100
 *       '401':
 *         description: Missing or invalid API key.
 */
export {};
