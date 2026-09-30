import type { VideoObject } from 'schema-dts';

export type CreateYoutubeVideoObjectSchemaParams = {
	/** YouTube video ID (not the full URL). */
	youtubeVideoId: string;
	/** Visible title for the video. */
	name: string;
	/** Short summary of what the video shows. */
	description: string;
	/** Page URL where the embed is rendered (docs or marketing canonical). */
	pageUrl: string;
	/**
	 * ISO 8601 date (or date-time) the video was first published.
	 * Required by Google for VideoObject rich results.
	 */
	uploadDate: string;
	/** Fragment for `@id` on the hosting page (default `video`). */
	fragmentId?: string;
	/** Optional parent entity `@id` (e.g. docs `TechArticle`). */
	isPartOfId?: string;
};

/**
 * JSON-LD `VideoObject` for YouTube embeds ([schema.org/VideoObject](https://schema.org/VideoObject)).
 */
export function createYoutubeVideoObjectSchema(
	params: CreateYoutubeVideoObjectSchemaParams
): VideoObject | Record<string, never> {
	const {
		youtubeVideoId,
		name,
		description,
		pageUrl,
		uploadDate,
		fragmentId = 'video',
		isPartOfId
	} = params;

	const videoId = youtubeVideoId.trim();
	const published = uploadDate.trim();
	const title = name.trim();
	const summary = description.trim();

	if (!videoId || !published || !title) {
		return {};
	}

	const pageBase = pageUrl.replace(/#.*$/, '');
	const fragment = fragmentId.trim() || 'video';

	return {
		'@type': 'VideoObject',
		'@id': `${pageBase}#${fragment}`,
		name: title,
		...(summary ? { description: summary } : {}),
		thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
		uploadDate: published,
		contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
		embedUrl: `https://www.youtube.com/embed/${videoId}`,
		...(isPartOfId ? { isPartOf: { '@id': isPartOfId } } : {})
	};
}
