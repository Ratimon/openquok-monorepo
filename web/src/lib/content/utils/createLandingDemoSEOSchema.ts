import type { VideoObject } from 'schema-dts';

export type CreateLandingDemoSEOSchemaParams = {
	/** YouTube video ID (not the full URL). */
	youtubeVideoId: string;
	/** Visible demo section title. */
	name: string;
	/** Visible demo section description. */
	description: string;
	/** Page URL where the demo section is rendered (typically landing canonical). */
	pageUrl: string;
	/**
	 * ISO 8601 date (or date-time) the video was first published.
	 * Required by Google for VideoObject rich results.
	 */
	uploadDate: string;
};

/**
 * JSON-LD `VideoObject` for the landing page product demo.
 * @see https://schema.org/VideoObject
 */
export function createLandingDemoSEOSchema(
	params: CreateLandingDemoSEOSchemaParams
): VideoObject | Record<string, never> {
	const { youtubeVideoId, name, description, pageUrl, uploadDate } = params;
	const videoId = youtubeVideoId.trim();
	const published = uploadDate.trim();
	if (!videoId || !published) {
		return {};
	}

	const pageBase = pageUrl.replace(/#.*$/, '');

	return {
		'@type': 'VideoObject',
		'@id': `${pageBase}#landing-demo`,
		name,
		description,
		thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
		uploadDate: published,
		contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
		embedUrl: `https://www.youtube.com/embed/${videoId}`
	};
}
