import type { HttpGateway } from '$lib/core/HttpGateway';
import { userFacingApiErrorMessage } from '$lib/core/HttpGateway';
import { mediaRepository, mediaVirtualPathForComposerUpload } from '$lib/medias';
import type { MediaUploadProgress } from '$lib/medias/utils/workspaceMediaUpload';

/** One image or video attached to a social post (R2 / user media paths from `/api/v1/media/*`). */
export type PostMediaProgrammerModel = {
	id: string;
	path: string;
	/** Wire field for create-post payloads; composer uploads use `social_media`. */
	bucket?: 'social_media';
};

function isComposerMediaFile(file: File): boolean {
	const mime = file.type.toLowerCase();
	if (mime.startsWith('image/') || mime.startsWith('video/')) return true;
	return /\.(png|jpe?g|gif|webp|svg|avif|mp4|mov|webm|m4v|mpeg)$/i.test(file.name);
}

/**
 * Multipart upload for social-post composer media; maps API paths to {@link PostMediaProgrammerModel}.
 */
export async function uploadSocialPostComposerMediaFiles(
	files: FileList,
	uploadUid: string,
	options?: { publishDateIso?: string | null; onProgress?: (progress: MediaUploadProgress) => void }
): Promise<
	{ ok: true; items: PostMediaProgrammerModel[] } | { ok: false; message: string }
> {
	const list = Array.from(files).filter(isComposerMediaFile);
	if (!list.length) {
		return { ok: false, message: 'Add image or video files only.' };
	}
	const virtualPath = mediaVirtualPathForComposerUpload(options?.publishDateIso);
	const totalBytes = list.reduce((sum, file) => sum + file.size, 0);
	let completedBytes = 0;
	const items: PostMediaProgrammerModel[] = [];
	for (const file of list) {
		const result = await mediaRepository.uploadMedia(file, uploadUid, virtualPath, {
			onProgress: ({ bytesUploaded, bytesTotal }) => {
				const batchTotal = totalBytes > 0 ? totalBytes : bytesTotal;
				const batchUploaded =
					totalBytes > 0
						? completedBytes + Math.round((bytesUploaded / Math.max(bytesTotal, 1)) * file.size)
						: bytesUploaded;
				options?.onProgress?.({ bytesUploaded: batchUploaded, bytesTotal: batchTotal });
			}
		});
		if (result.success && result.data.filePath) {
			completedBytes += file.size;
			options?.onProgress?.({ bytesUploaded: completedBytes, bytesTotal: totalBytes });
			items.push({ id: crypto.randomUUID(), path: result.data.filePath, bucket: 'social_media' });
		} else {
			return { ok: false, message: result.message || 'Upload failed.' };
		}
	}
	return { ok: true, items };
}

export type PostTagProgrammerModel = {
	id: string;
	name: string;
	color?: string;
};

/** Composer UI shape; structurally identical to {@link PostTagProgrammerModel}. */
export type PostTagViewModel = PostTagProgrammerModel;

/** Composer UI shape; structurally identical to {@link PostMediaProgrammerModel}. */
export type PostMediaViewModel = PostMediaProgrammerModel;

/** Result of POST tag create (repository maps wire response). */
export type PostTagCreateProgrammerModel =
	| { ok: true; tag: PostTagProgrammerModel }
	| { ok: false; error: string };

/**
 * Result of POST create / PUT update post group, or DELETE post group on success
 * (`postIds` empty when the API does not return rows after delete).
 */
export type PostUpsertProgrammerModel =
	| { ok: true; postGroup: string; postIds: string[] }
	| { ok: false; error: string };

export type FindSlotResponseDto = {
	success?: boolean;
	data?: { date?: string };
};

export type ListTagsResponseDto = {
	success?: boolean;
	data?: { tags?: PostTagProgrammerModel[] };
};

export type CreateTagResponseDto = {
	success?: boolean;
	data?: { tag?: PostTagProgrammerModel };
};

export type DeleteTagResponseDto = {
	success?: boolean;
};

export type PostRowProgrammerModel = {
	id: string;
	postGroup: string;
	state: string;
	publishDate: string;
	organizationId: string;
	integrationId: string | null;
	content: string;
	/** Repeat cadence in days when applicable (`posts.interval_in_days`). */
	intervalInDays?: number | null;
	/** Composer repeat key when applicable (`posts.settings.repeatInterval`). */
	repeatInterval?: RepeatIntervalKey | null;
	error?: string | null;
	note?: string | null;
	/** Null when the post was created via CLI/agent (`posts.created_by_user_id`). */
	createdByUserId?: string | null;
	isAgentEdited?: boolean;
	isReviewed?: boolean;
	/** From list/flip API — resolved `integrations` row (includes soft-deleted). */
	channelName?: string | null;
	channelPictureUrl?: string | null;
	providerIdentifier?: string | null;
	/** Serialized `posts.settings` JSON from list/flip API. */
	settings?: string | null;
	/** Workspace tag names on this post row (list/flip API). */
	tagNames?: string[];
};

export type CreatePostResponseDto = {
	success?: boolean;
	data?: {
		postGroup?: string;
		posts?: PostRowProgrammerModel[];
	};
};

export type ListPostsResponseDto = {
	success?: boolean;
	data?: {
		posts?: (PostRowProgrammerModel & {
			integration_id?: string | null;
			channel_name?: string | null;
			channel_picture_url?: string | null;
			provider_identifier?: string | null;
		})[];
	};
};

/** API rows may use camelCase or legacy snake_case field names. */
function normalizePostRowFromApi(
	raw: PostRowProgrammerModel & {
		integration_id?: string | null;
		channel_name?: string | null;
		channel_picture_url?: string | null;
		provider_identifier?: string | null;
	}
): PostRowProgrammerModel {
	const integrationId = raw.integrationId ?? raw.integration_id ?? null;
	const channelName = raw.channelName ?? raw.channel_name ?? null;
	const channelPictureUrl = raw.channelPictureUrl ?? raw.channel_picture_url ?? null;
	const providerIdentifier = raw.providerIdentifier ?? raw.provider_identifier ?? null;
	return { ...raw, integrationId, channelName, channelPictureUrl, providerIdentifier };
}

export type PostGroupDetailsProgrammerModel = {
	postGroup: string;
	organizationId: string;
	isGlobal: boolean;
	repeatInterval: RepeatIntervalKey | null;
	publishDateIso: string;
	status: 'draft' | 'scheduled';
	integrationIds: string[];
	body: string;
	bodiesByIntegrationId: Record<string, string>;
	media: PostMediaProgrammerModel[];
	tagNames: string[];
	postIds?: string[];
	providerSettingsByIntegrationId?: Record<string, Record<string, unknown>>;
};

export type GetPostGroupResponseDto = {
	success?: boolean;
	data?: PostGroupDetailsProgrammerModel;
};

export type DebugExportPostGroupProgrammerModel = {
	postGroup: string;
	organizationId: string;
	group: PostGroupDetailsProgrammerModel;
	/**
	 * Backend returns raw `posts` rows for debugging. This is intentionally not modeled in the web client
	 * because it is not a stable UI contract.
	 */
	posts: { id: string }[];
};

export type DebugExportPostGroupResponseDto = {
	success?: boolean;
	data?: DebugExportPostGroupProgrammerModel;
};

export type PostPreviewProgrammerModel = {
	id: string;
	postGroup: string;
	organizationId: string;
	publishDateIso: string;
	content: string;
	media: { id: string; path: string }[];
	/** Resolved from the linked integration's provider when present. */
	socialPlatformLabel?: string | null;
	integrationId?: string | null;
	providerIdentifier?: string | null;
	channelName?: string | null;
	channelPictureUrl?: string | null;
	threadReplies?: { id: string; message: string; delaySeconds: number }[];
	threadFinisher?: { enabled: boolean; message: string } | null;
	/** Threads: `threads.internalEngagementPlug` when enabled (public preview API). */
	delayedEngagementReply?: { message: string; delaySeconds: number } | null;
	sharePostPreviewEnabled?: boolean;
	/** When true, the signed-in viewer may post collaboration comments on this share preview. */
	collaborationCommentsEnabled?: boolean;
};

export type GetPostPreviewResponseDto = {
	success?: boolean;
	data?: PostPreviewProgrammerModel;
};

export type PostCommentProgrammerModel = {
	id: string;
	postId: string;
	organizationId: string;
	userId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export type GetPublicPostCommentsResponseDto = {
	comments?: PostCommentProgrammerModel[];
};

export type CreatePostCommentResponseDto = {
	success?: boolean;
	data?: {
		comment?: PostCommentProgrammerModel;
	};
};

/** Result of POST post comment create (repository maps wire response). */
export type PostCommentCreateProgrammerModel =
	| { ok: true; comment: PostCommentProgrammerModel }
	| { ok: false; error: string };

export type MissingPublishCandidateProgrammerModel = { id: string; url: string };

export type LoadMissingPublishCandidatesResultProgrammerModel =
	| { ok: true; items: MissingPublishCandidateProgrammerModel[] }
	| { ok: false; error: string };

export type UpdatePostReleaseIdResultProgrammerModel = { ok: true } | { ok: false; error: string };

export type GetMissingPublishCandidatesResponseDto = {
	success?: boolean;
	data?: { items?: MissingPublishCandidateProgrammerModel[] };
};

export type UpdatePostReleaseIdResponseDto = {
	success?: boolean;
	data?: { id?: string; releaseId?: string };
};

export type RepeatIntervalKey =
	| 'day'
	| 'two_days'
	| 'three_days'
	| 'four_days'
	| 'five_days'
	| 'six_days'
	| 'week'
	| 'two_weeks'
	| 'month';

export type CreatePostProgrammerModel = {
	organizationId: string;
	body: string;
	/** Optional per-channel body overrides (keyed by integration id). */
	bodiesByIntegrationId?: Record<string, string>;
	/** Optional provider-defined per-channel settings (keyed by integration id). */
	providerSettingsByIntegrationId?: Record<string, Record<string, unknown>>;
	/** Image attachments (composer / R2 object keys; see `social_media` on each item when set). */
	media?: PostMediaProgrammerModel[];
	integrationIds: string[];
	isGlobal: boolean;
	scheduledAt: string;
	repeatInterval: RepeatIntervalKey | null;
	tagNames: string[];
	status: 'draft' | 'scheduled';
};

export type UpdatePostGroupProgrammerModel = Omit<CreatePostProgrammerModel, 'organizationId'> & {
	organizationId?: string;
};

export interface PostsConfig {
	endpoints: {
		findSlot: string;
		tags: string;
		createTag: string;
		createPost: string;
		listPosts: string;
		getPostGroup: string;
		debugExportPostGroup: string;
		getPostPreview: string;
		getPublicPostComments: (postId: string) => string;
		createPostComment: (postId: string) => string;
		updatePostGroup: string;
		deletePostGroup: string;
		missingPublishCandidates: (postId: string) => string;
		updatePostReleaseId: (postId: string) => string;
		updatePostReviewTodo: (postId: string) => string;
		flipPostStatus: (postId: string) => string;
	};
}

export class PostsRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: PostsConfig
	) {}

	async findSlot(organizationId: string): Promise<{ ok: true; dateIso: string } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.get<FindSlotResponseDto>(
				this.config.endpoints.findSlot,
				{ organizationId },
				{ withCredentials: true }
			);
			const date = dto?.data?.date;
			if (ok && typeof date === 'string' && date.length > 0) {
				return { ok: true, dateIso: date };
			}
			return { ok: false, error: 'Could not suggest a time slot.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not suggest a time slot.');
		}
	}

	async listTags(
		organizationId: string
	): Promise<{ ok: true; tags: PostTagProgrammerModel[] } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.get<ListTagsResponseDto>(
				this.config.endpoints.tags,
				{ organizationId },
				{ withCredentials: true }
			);
			if (ok && dto?.success === true && Array.isArray(dto.data?.tags)) {
				return { ok: true, tags: dto.data.tags };
			}
			return { ok: false, error: 'Could not load tags.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not load tags.');
		}
	}

	async createTag(
		organizationId: string,
		name: string,
		color?: string
	): Promise<PostTagCreateProgrammerModel> {
		try {
			const { ok, data: dto } = await this.httpGateway.post<CreateTagResponseDto>(
				this.config.endpoints.createTag,
				{ organizationId, name, ...(color ? { color } : {}) },
				{ withCredentials: true }
			);
			const tag = dto?.data?.tag;
			if (ok && dto?.success === true && tag?.id && tag.name) {
				return { ok: true, tag };
			}
			return { ok: false, error: 'Could not create tag.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not create tag.');
		}
	}

	async deleteTag(
		organizationId: string,
		tagId: string
	): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			const url = `${this.config.endpoints.tags}/${encodeURIComponent(tagId)}`;
			const { ok, data: dto } = await this.httpGateway.delete<DeleteTagResponseDto>(url, {
				params: { organizationId },
				withCredentials: true
			});
			if (ok && dto?.success === true) {
				return { ok: true };
			}
			return { ok: false, error: 'Could not delete tag.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not delete tag.');
		}
	}

	async createPost(
		payload: CreatePostProgrammerModel
	): Promise<PostUpsertProgrammerModel> {
		try {
			const { ok, data: dto } = await this.httpGateway.post<CreatePostResponseDto>(
				this.config.endpoints.createPost,
				payload,
				{ withCredentials: true }
			);
			const posts = dto?.data?.posts;
			const postGroup = dto?.data?.postGroup;
			if (
				ok &&
				dto?.success === true &&
				typeof postGroup === 'string' &&
				Array.isArray(posts) &&
				posts.length > 0
			) {
				return {
					ok: true,
					postGroup,
					postIds: posts.map((p) => p.id).filter(Boolean)
				};
			}
			return { ok: false, error: 'Could not save post.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not save post.');
		}
	}

	async listPosts({
		organizationId,
		startIso,
		endIso,
		integrationIds
	}: {
		organizationId: string;
		startIso: string;
		endIso: string;
		integrationIds?: string[] | null;
	}): Promise<{ ok: true; posts: PostRowProgrammerModel[] } | { ok: false; error: string }> {
		try {
			const params: Record<string, string> = {
				organizationId,
				start: startIso,
				end: endIso
			};
			if (integrationIds && integrationIds.length > 0) {
				params.integrationIds = integrationIds.join(',');
			}
			const { ok, data: dto } = await this.httpGateway.get<ListPostsResponseDto>(
				this.config.endpoints.listPosts,
				params,
				{ withCredentials: true }
			);
			if (ok && dto?.success === true && Array.isArray(dto.data?.posts)) {
				return { ok: true, posts: dto.data.posts.map(normalizePostRowFromApi) };
			}
			return { ok: false, error: 'Could not load scheduled posts.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not load scheduled posts.');
		}
	}

	async getPostGroup(
		postGroup: string
	): Promise<{ ok: true; group: PostGroupDetailsProgrammerModel } | { ok: false; error: string }> {
		try {
			const url = `${this.config.endpoints.getPostGroup}/${encodeURIComponent(postGroup)}`;
			const { ok, data: dto } = await this.httpGateway.get<GetPostGroupResponseDto>(
				url,
				{},
				{ withCredentials: true }
			);
			if (ok && dto?.success === true && dto.data?.postGroup) {
				return { ok: true, group: dto.data };
			}
			return { ok: false, error: 'Could not load post.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not load post.');
		}
	}

	async debugExportPostGroup(
		postGroup: string
	): Promise<{ ok: true; data: DebugExportPostGroupProgrammerModel } | { ok: false; error: string }> {
		try {
			const url = `${this.config.endpoints.debugExportPostGroup}/${encodeURIComponent(postGroup)}/debug-export`;
			const { ok, data: dto } = await this.httpGateway.get<DebugExportPostGroupResponseDto>(
				url,
				{},
				{ withCredentials: true }
			);
			if (ok && dto?.success === true && dto.data) {
				return { ok: true, data: dto.data };
			}
			return { ok: false, error: 'Could not export debug data.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not export debug data.');
		}
	}

	async getPostPreview(
		postId: string,
		options?: { fetch?: typeof globalThis.fetch }
	): Promise<{ ok: true; post: PostPreviewProgrammerModel } | { ok: false; error: string }> {
		try {
			const url = `${this.config.endpoints.getPostPreview}/${encodeURIComponent(postId)}`;
			const { ok, data: dto } = await this.httpGateway.get<GetPostPreviewResponseDto>(
				url,
				{ share: 'true' },
				{ withCredentials: true, ...(options?.fetch ? { fetch: options.fetch } : {}) }
			);
			if (ok && dto?.success === true && dto.data?.id) {
				return { ok: true, post: dto.data };
			}
			return { ok: false, error: 'Could not load preview.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not load preview.');
		}
	}

	async getPublicPostComments(
		postId: string,
		options?: { fetch?: typeof globalThis.fetch }
	): Promise<{ ok: true; comments: PostCommentProgrammerModel[] } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.get<GetPublicPostCommentsResponseDto>(
				this.config.endpoints.getPublicPostComments(postId),
				undefined,
				{ withCredentials: false, ...(options?.fetch ? { fetch: options.fetch } : {}) }
			);
			if (ok && Array.isArray(dto?.comments)) {
				return { ok: true, comments: dto.comments };
			}
			return { ok: false, error: 'Could not load comments.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not load comments.');
		}
	}

	async createPostComment(params: {
		postId: string;
		organizationId: string;
		comment: string;
	}): Promise<PostCommentCreateProgrammerModel> {
		try {
			const { ok, data: dto } = await this.httpGateway.post<CreatePostCommentResponseDto>(
				this.config.endpoints.createPostComment(params.postId),
				{
					organizationId: params.organizationId,
					comment: params.comment
				},
				{ withCredentials: true }
			);
			const commentPm = dto?.data?.comment;
			if (ok && dto?.success === true && commentPm?.id) {
				return { ok: true, comment: commentPm };
			}
			return { ok: false, error: 'Could not submit comment.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not submit comment.');
		}
	}

	async updatePostGroup(
		postGroup: string,
		payload: UpdatePostGroupProgrammerModel
	): Promise<PostUpsertProgrammerModel> {
		try {
			const url = `${this.config.endpoints.updatePostGroup}/${encodeURIComponent(postGroup)}`;
			const { ok, data: dto } = await this.httpGateway.put<CreatePostResponseDto>(
				url,
				payload,
				{ withCredentials: true }
			);
			const posts = dto?.data?.posts;
			const outGroup = dto?.data?.postGroup;
			if (ok && dto?.success === true && typeof outGroup === 'string' && Array.isArray(posts) && posts.length > 0) {
				return { ok: true, postGroup: outGroup, postIds: posts.map((p) => p.id).filter(Boolean) };
			}
			return { ok: false, error: 'Could not update post.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not update post.');
		}
	}

	async deletePostGroup(postGroup: string): Promise<PostUpsertProgrammerModel> {
		try {
			const url = `${this.config.endpoints.deletePostGroup}/${encodeURIComponent(postGroup)}`;
			const { ok, data: dto } = await this.httpGateway.delete<{ success?: boolean }>(url, {
				withCredentials: true
			});
			if (ok && dto?.success === true) return { ok: true, postGroup, postIds: [] };
			return { ok: false, error: 'Could not delete post.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not delete post.');
		}
	}

	async getMissingPublishCandidates(params: {
		postId: string;
		organizationId: string;
	}): Promise<LoadMissingPublishCandidatesResultProgrammerModel> {
		try {
			const { ok, data: dto } = await this.httpGateway.get<GetMissingPublishCandidatesResponseDto>(
				this.config.endpoints.missingPublishCandidates(params.postId),
				{ organizationId: params.organizationId },
				{ withCredentials: true }
			);
			const items = dto?.data?.items;
			if (ok && dto?.success === true && Array.isArray(items)) {
				return { ok: true, items };
			}
			return { ok: false, error: 'Could not load candidates.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not load candidates.');
		}
	}

	async updatePostReleaseId(params: {
		postId: string;
		organizationId: string;
		releaseId: string;
	}): Promise<UpdatePostReleaseIdResultProgrammerModel> {
		try {
			const { ok, data: dto } = await this.httpGateway.put<UpdatePostReleaseIdResponseDto>(
				this.config.endpoints.updatePostReleaseId(params.postId),
				{ organizationId: params.organizationId, releaseId: params.releaseId },
				{ withCredentials: true }
			);
			if (ok && dto?.success === true) return { ok: true };
			return { ok: false, error: 'Could not connect post.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not connect post.');
		}
	}

	async flipPostStatus(params: {
		postId: string;
		organizationId: string;
		status: 'draft' | 'scheduled';
	}): Promise<{ ok: true; posts: PostRowProgrammerModel[] } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.put<ListPostsResponseDto>(
				this.config.endpoints.flipPostStatus(params.postId),
				{ organizationId: params.organizationId, status: params.status },
				{ withCredentials: true }
			);
			if (ok && dto?.success === true && Array.isArray(dto.data?.posts)) {
				return { ok: true, posts: dto.data.posts.map(normalizePostRowFromApi) };
			}
			return { ok: false, error: 'Could not update post status.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not update post status.');
		}
	}

	async updatePostReviewTodo(params: {
		postId: string;
		organizationId: string;
		note?: string | null;
		isReviewed?: boolean;
	}): Promise<{ ok: true; posts: PostRowProgrammerModel[] } | { ok: false; error: string }> {
		try {
			const body: Record<string, unknown> = { organizationId: params.organizationId };
			if (params.note !== undefined) body.note = params.note;
			if (params.isReviewed !== undefined) body.isReviewed = params.isReviewed;
			const { ok, data: dto } = await this.httpGateway.put<ListPostsResponseDto>(
				this.config.endpoints.updatePostReviewTodo(params.postId),
				body,
				{ withCredentials: true }
			);
			if (ok && dto?.success === true && Array.isArray(dto.data?.posts)) {
				return { ok: true, posts: dto.data.posts.map(normalizePostRowFromApi) };
			}
			return { ok: false, error: 'Could not update review.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not update review.');
		}
	}

	private mapCatch(error: unknown, fallback: string): { ok: false; error: string } {
		return { ok: false, error: userFacingApiErrorMessage(error, fallback) };
	}
}
