import { z } from 'zod';

export const ACQUISITION_SURVEY_SOURCE_SLUGS = [
	'search_engine',
	'reddit',
	'x',
	'chatgpt',
	'youtube',
	'launch_platform',
	'openquok_blog',
	'recommendation',
	'tiktok',
	'email_outreach',
	'ads',
	'newsletter',
	'podcast',
	'linkedin',
	'other'
] as const;

export type AcquisitionSurveySourceSlug = (typeof ACQUISITION_SURVEY_SOURCE_SLUGS)[number];

export const acquisitionSurveySourceSchema = z.enum(ACQUISITION_SURVEY_SOURCE_SLUGS);

export const acquisitionSurveyOtherDetailSchema = z
	.string()
	.trim()
	.max(200, 'Please keep your answer under 200 characters.');

export const acquisitionSurveyOtherFormSchema = z.object({
	otherDetail: acquisitionSurveyOtherDetailSchema.min(1, 'Tell us where you heard about us.')
});
