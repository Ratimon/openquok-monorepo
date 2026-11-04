export type DocsYoutubeVideoPreset = 'connectChannels' | 'chromeExtension';

export type DocsYoutubeVideoConfig = {
	youtubeVideoId: string;
	thumbnailAlt: string;
	/** JSON-LD `VideoObject.name` */
	name: string;
	/** JSON-LD `VideoObject.description` */
	description: string;
	/** ISO 8601 — required for Google VideoObject rich results */
	uploadDate: string;
	/** `@id` fragment on the docs page canonical URL */
	schemaFragmentId: string;
};

/** YouTube IDs and VideoObject metadata for General-tab docs embeds. */
export const DOCS_YOUTUBE_VIDEOS: Record<DocsYoutubeVideoPreset, DocsYoutubeVideoConfig> = {
	connectChannels: {
		youtubeVideoId: 'HhUhqtE_EYM',
		thumbnailAlt: 'How to connect a social channel in OpenQuok',
		name: 'How to connect a social channel in OpenQuok',
		description:
			'Walk through Add Channel on My Dashboard — OAuth redirect and credential-based networks.',
		uploadDate: '2026-09-30T00:00:00Z',
		schemaFragmentId: 'connect-channels-video'
	},
	chromeExtension: {
		youtubeVideoId: 'CU-BIS006oQ',
		thumbnailAlt: 'OpenQuok Chrome browser extension — side panel, scheduling, and directory autofill',
		name: 'OpenQuok Chrome browser extension walkthrough',
		description:
			'Install the OpenQuok extension, sign in from the side panel, schedule or draft posts, and autofill directory launch forms.',
		uploadDate: '2026-11-04T00:00:00Z',
		schemaFragmentId: 'chrome-extension-video'
	}
};
