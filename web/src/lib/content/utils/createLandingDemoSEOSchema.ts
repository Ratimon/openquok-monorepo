import type { VideoObject } from 'schema-dts';

import {
	createYoutubeVideoObjectSchema,
	type CreateYoutubeVideoObjectSchemaParams
} from '$lib/seo/createYoutubeVideoObjectSchema';

export type CreateLandingDemoSEOSchemaParams = Omit<
	CreateYoutubeVideoObjectSchemaParams,
	'fragmentId'
>;

/**
 * JSON-LD `VideoObject` for the landing page product demo.
 * @see https://schema.org/VideoObject
 */
export function createLandingDemoSEOSchema(
	params: CreateLandingDemoSEOSchemaParams
): VideoObject | Record<string, never> {
	return createYoutubeVideoObjectSchema({
		...params,
		fragmentId: 'landing-demo'
	});
}
