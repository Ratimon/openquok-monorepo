import type { VideoObject } from 'schema-dts';

import {
	DOCS_YOUTUBE_VIDEOS,
	type DocsYoutubeVideoPreset
} from '$lib/docs/constants/docsYoutubeVideos';
import { createYoutubeVideoObjectSchema } from '$lib/seo/createYoutubeVideoObjectSchema';

export function createDocsVideoObjectNodes(params: {
	presets: DocsYoutubeVideoPreset[];
	canonicalUrl: string;
	techArticleId: string;
}): VideoObject[] {
	const { presets, canonicalUrl, techArticleId } = params;

	return presets
		.map((preset) => {
			const config = DOCS_YOUTUBE_VIDEOS[preset];
			return createYoutubeVideoObjectSchema({
				youtubeVideoId: config.youtubeVideoId,
				name: config.name,
				description: config.description,
				pageUrl: canonicalUrl,
				uploadDate: config.uploadDate,
				fragmentId: config.schemaFragmentId,
				isPartOfId: techArticleId
			});
		})
		.filter((node): node is VideoObject => '@type' in node && node['@type'] === 'VideoObject');
}
