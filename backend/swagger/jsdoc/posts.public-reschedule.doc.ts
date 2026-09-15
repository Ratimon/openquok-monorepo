/**
 * Programmatic reschedule ({@link routes/publicApi/PostRoutes.ts}).
 *
 * Moves a post group's publish time via any row id. `update` preserves row state;
 * `schedule` re-queues (or keeps all-draft) and clears publish results. Backed by
 * {@link services/PostsService.reschedulePostGroupByPostIdProgrammatic}.
 *
 * @openapi
 * /public/posts/{postId}/reschedule:
 *   put:
 *     operationId: putPublicPostReschedule
 *     tags:
 *       - Posts
 *     summary: Reschedule a post group (API key)
 *     description: >-
 *       Pass any post row UUID from `GET /public/posts/list` in `{postId}`.
 *       The server loads the parent group and sets `scheduledAt` on every row.
 *       Use `action: update` (default) to move publish time only — draft and scheduled
 *       rows keep their state. Use `action: schedule` to re-queue publishing at the new
 *       time (clears `releaseId`, `releaseUrl`, and errors). For published groups,
 *       `action: schedule` requires `republish: true` or the server returns `400`.
 *       To flip draft ↔ scheduled without changing time, use
 *       `PUT /public/posts/{postId}/status` instead.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post row UUID (any row in the target group).
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scheduledAt]
 *             properties:
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: New publish time (ISO-8601). Must be in the future for non-published groups when using `update`; `schedule` always requires a future time.
 *               action:
 *                 type: string
 *                 enum: [update, schedule]
 *                 default: update
 *                 description: '`update` moves time only; `schedule` re-queues and clears publish results.'
 *               republish:
 *                 type: boolean
 *                 description: Required `true` when `action` is `schedule` and any row in the group is already published.
 *           example:
 *             scheduledAt: '2026-06-15T14:30:00.000Z'
 *             action: update
 *             republish: false
 *     responses:
 *       '200':
 *         description: Post group updated (same shape as create/status responses).
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
 *                   required: [postGroup, posts]
 *                   properties:
 *                     postGroup:
 *                       type: string
 *                       format: uuid
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SocialPostDTO'
 *             example:
 *               success: true
 *               data:
 *                 postGroup: 9a0a1b2c-3d4e-4f5a-9b8c-aa11bb22cc33
 *                 posts:
 *                   - id: 5b3c1d2e-9a3f-4e6b-bb12-2c0a5f1a90a1
 *                     state: QUEUE
 *                     publishDate: '2026-06-15T14:30:00.000Z'
 *                     organizationId: c1d8a3f4-1234-4abc-bf12-1234567890ab
 *                     integrationId: 1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *                     content: 'Hello — moved to a new slot'
 *                     delay: 0
 *                     postGroup: 9a0a1b2c-3d4e-4f5a-9b8c-aa11bb22cc33
 *                     title: null
 *                     description: null
 *                     parentPostId: null
 *                     releaseId: null
 *                     releaseUrl: null
 *                     settings: null
 *                     image: null
 *                     intervalInDays: null
 *                     error: null
 *                     deletedAt: null
 *                     createdByUserId: null
 *                     createdAt: '2026-05-10T09:00:00.000Z'
 *                     updatedAt: '2026-05-10T10:00:00.000Z'
 *       '400':
 *         description: Validation error, past schedule time, failed post row, or republish required for published groups.
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Post not found in this workspace.
 *       '409':
 *         description: Another queued post already occupies that time slot.
 */
export {};
