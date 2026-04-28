import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError } from '$lib/core/HttpGateway';
import { mediaRepository } from '$lib/media';
import { publicUrlForMediaStorageKey } from '$lib/media/utils/publicMediaObjectUrl';

/** One image attached to a social post (R2 / user media paths from `/api/v1/media/*`). */
export type PostMediaProgrammerModel = {
	id: string;
	path: string;
	/** Wire field for create-post payloads; composer uploads use `social_media`. */
	bucket?: 'social_media';
};

export function mediaItemsToPreviewUrls(items: PostMediaProgrammerModel[]): string[] {
	return items.map((m) => publicUrlForMediaStorageKey(m.path));
}

/**
 * Multipart upload for social-post composer images; maps API paths to {@link PostMediaProgrammerModel}.
 */
export async function uploadSocialPostComposerMediaFiles(
	files: FileList,
	uploadUid: string
): Promise<
	{ ok: true; items: PostMediaProgrammerModel[] } | { ok: false; message: string }
> {
	const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
	if (!list.length) {
		return { ok: false, message: 'Add image files only.' };
	}
	const items: PostMediaProgrammerModel[] = [];
	for (const file of list) {
		const result = await mediaRepository.uploadMedia(file, uploadUid);
		if (result.success && result.data.filePath) {
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
	error?: string | null;
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
	data?: { posts?: PostRowProgrammerModel[] };
};

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
	posts: unknown[];
};

export type DebugExportPostGroupResponseDto = {
	success?: boolean;
	data?: DebugExportPostGroupProgrammerModel;
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
		updatePostGroup: string;
		deletePostGroup: string;
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
	): Promise<{ ok: true; tag: PostTagProgrammerModel } | { ok: false; error: string }> {
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
	): Promise<{ ok: true; postGroup: string; postIds: string[] } | { ok: false; error: string }> {
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
				return { ok: true, posts: dto.data.posts };
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

	async updatePostGroup(
		postGroup: string,
		payload: UpdatePostGroupProgrammerModel
	): Promise<{ ok: true; postGroup: string; postIds: string[] } | { ok: false; error: string }> {
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

	async deletePostGroup(postGroup: string): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			const url = `${this.config.endpoints.deletePostGroup}/${encodeURIComponent(postGroup)}`;
			const { ok, data: dto } = await this.httpGateway.delete<{ success?: boolean }>(url, {
				withCredentials: true
			});
			if (ok && dto?.success === true) return { ok: true };
			return { ok: false, error: 'Could not delete post.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not delete post.');
		}
	}

	private mapCatch(error: unknown, fallback: string): { ok: false; error: string } {
		if (error instanceof ApiError && typeof error.data === 'object' && error.data !== null) {
			const o = error.data as Record<string, unknown>;
			if (typeof o.message === 'string') return { ok: false, error: o.message };
		}
		return { ok: false, error: fallback };
	}
}
