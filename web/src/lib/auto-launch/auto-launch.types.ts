import { z } from 'zod';

import { normalizeHttpUrlInputIfLikely } from '$lib/utils/normalizeHttpUrlInput';

import type {
	AutoLaunchExtensionConfig,
	AutoLaunchProfileSnapshot,
	BusinessProfileData
} from 'openquok-common';
import {
	BUSINESS_PROFILE_INCLUDED_ASSET_SLUGS,
	BUSINESS_PROFILE_MAX_GALLERY_URLS,
	BUSINESS_PROFILE_MAX_TAGS,
	BUSINESS_PROFILE_PRICING_TYPES,
	BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH
} from 'openquok-common';

export type { BusinessProfileData };

export type BusinessProfileDto = {
	integrationCustomerId: string | null;
	productProfileId: string | null;
	name: string;
	tagline: string | null;
	websiteUrl: string | null;
	logoUrl: string | null;
};

export type AutoLaunchProductProfileDto = {
	id: string;
	organizationId: string;
	integrationCustomerId: string | null;
	name: string;
	tagline: string | null;
	description: string | null;
	websiteUrl: string | null;
	logoUrl: string | null;
	profileData: BusinessProfileData;
	createdAt: string;
	updatedAt: string;
};

export type AutoLaunchDestinationDto = {
	id: string;
	providerSlug: string;
	name: string;
	shortDescription: string | null;
	submissionPath: 'extension' | 'auto';
	startUrl: string;
	sortOrder: number;
	opportunityDescription: string | null;
	opportunityTitle: string | null;
	opportunityDofollow: 'dofollow' | 'nofollow' | 'unknown' | null;
	opportunityCostTier: 'free' | 'freemium' | 'paid' | null;
	opportunityCostNote: string | null;
	siteDomainRating: number | null;
	siteTitle: string | null;
	pickerGroupKey: string | null;
	pickerGroupTitle: string | null;
};

export type AutoLaunchAdminDestinationDto = AutoLaunchDestinationDto & {
	linkDirectoryOpportunityId: string | null;
	extensionConfig: AutoLaunchExtensionConfig;
	isPublished: boolean;
	createdAt: string;
	updatedAt: string;
};

export type DirectoryLaunchProviderSummary = {
	identifier: string;
	name: string;
};

export type AutoLaunchUpsertResult = { ok: boolean; data?: AutoLaunchAdminDestinationDto; error?: string };

export type AutoLaunchSubmissionSyncStatus = 'pending' | 'synced' | 'stale';

export type AutoLaunchSubmissionDto = {
	id: string;
	organizationId: string;
	productProfileId: string;
	destinationId: string;
	status: string;
	listingUrl: string | null;
	intentCreatedAt: string | null;
	completedAt: string | null;
	listingSyncedAt: string | null;
	syncStatus: AutoLaunchSubmissionSyncStatus;
	createdAt: string;
	updatedAt: string;
};

export type AutoLaunchSubmissionIntentDto = {
	submissionId: string;
	launchToken: string;
	startUrl: string;
	providerSlug: string;
	profileSnapshot: AutoLaunchProfileSnapshot;
	extensionConfig: AutoLaunchExtensionConfig;
	steps: AutoLaunchExtensionConfig['steps'];
};

/** Form/API may send `null` for empty optional text fields. */
const optionalStringInput = z
	.union([z.string(), z.null(), z.undefined()])
	.transform((value) => (value == null ? '' : value));

const optionalUrlField = optionalStringInput.pipe(
	z
		.string()
		.trim()
		.max(2000)
		.transform((value) => {
			if (!value) return null;
			const normalized = normalizeHttpUrlInputIfLikely(value);
			return normalized.length === 0 ? null : normalized;
		})
		.pipe(z.union([z.string().url('Enter a valid URL (https://…)'), z.null()]))
);

const nullableTrimmedString = (max: number) =>
	optionalStringInput.pipe(
		z
			.string()
			.max(max)
			.trim()
			.optional()
			.transform((value) => {
				if (value === undefined) return undefined;
				const trimmed = value.trim();
				return trimmed.length === 0 ? null : trimmed;
			})
	);

const optionalHttpUrlField = optionalStringInput.pipe(
	z
		.string()
		.max(2000)
		.trim()
		.optional()
		.transform((value) => {
			if (value === undefined) return undefined;
			const trimmed = value.trim();
			if (trimmed.length === 0) return null;
			const normalized = normalizeHttpUrlInputIfLikely(trimmed);
			return normalized.length === 0 ? null : normalized;
		})
		.pipe(z.union([z.undefined(), z.null(), z.string().url('Enter a valid URL (https://…)')]))
);

const optionalUsdFormField = z
	.union([z.string(), z.number()])
	.optional()
	.transform((value) => {
		if (value === undefined) return undefined;
		if (value === '' || value === null) return null;
		const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, '').trim());
		if (!Number.isFinite(n) || n < 0) return null;
		return n;
	});

export const businessProfileDataFormSchema = z
	.object({
		slug: nullableTrimmedString(120).pipe(
			z.union([
				z.undefined(),
				z.null(),
				z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, and hyphens')
			])
		),
		category: nullableTrimmedString(200),
		pricing_type: z
			.union([z.enum(BUSINESS_PROFILE_PRICING_TYPES), z.null(), z.literal('')])
			.optional()
			.transform((value) => (value === null || value === '' ? undefined : value)),
		tags: z
			.array(z.string().trim().min(1).max(80))
			.max(BUSINESS_PROFILE_MAX_TAGS)
			.optional()
			.default([]),
		is_open_source: z.boolean().optional().default(false),
		repository_url: optionalHttpUrlField,
		launch_video_url: optionalHttpUrlField,
		gallery_urls: z
			.array(z.string().max(2000).trim().min(1))
			.max(BUSINESS_PROFILE_MAX_GALLERY_URLS)
			.optional()
			.default([]),
		social_x: optionalHttpUrlField,
		social_github: optionalHttpUrlField,
		social_instagram: optionalHttpUrlField,
		social_linkedin: optionalHttpUrlField,
		social_tiktok: optionalHttpUrlField,
		social_facebook: optionalHttpUrlField,
		social_youtube: optionalHttpUrlField,
		social_bluesky: optionalHttpUrlField,
		acquisition_listed: z.boolean().optional().default(false),
		asking_price_usd: optionalUsdFormField,
		ttm_revenue_usd: optionalUsdFormField,
		monthly_revenue_usd: optionalUsdFormField,
		ttm_profit_usd: optionalUsdFormField,
		monthly_profit_usd: optionalUsdFormField,
		selling_reason: nullableTrimmedString(10_000),
		included_assets: z
			.array(z.enum(BUSINESS_PROFILE_INCLUDED_ASSET_SLUGS))
			.optional()
			.default([])
	})
	.superRefine((data, ctx) => {
		const reason = data.selling_reason?.trim() ?? '';
		const listed = Boolean(data.acquisition_listed);
		if (reason.length > 0 && reason.length < BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Selling reason must be at least ${BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH} characters`,
				path: ['selling_reason']
			});
		}
		if (listed && reason.length < BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Selling reason is required (${BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH}+ characters) when listed for acquisition`,
				path: ['selling_reason']
			});
		}
		if (data.is_open_source && data.repository_url === null) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Repository URL is required when open source is enabled',
				path: ['repository_url']
			});
		}
	});

export type BusinessProfileDataFormValues = z.infer<typeof businessProfileDataFormSchema>;
export type BusinessProfileDataFormInput = z.input<typeof businessProfileDataFormSchema>;

/** Parsed business profile form output (explicit — nested `.pipe()` breaks `z.infer`). */
export type AutoLaunchProductProfileFormValues = {
	name: string;
	tagline: string | null;
	description: string | null;
	websiteUrl: string | null;
	logoUrl: string | null;
	integrationCustomerId?: string | null;
	profileData: BusinessProfileDataFormValues;
};

export const autoLaunchProductProfileFormSchema: z.ZodType<AutoLaunchProductProfileFormValues> = z.object({
	name: optionalStringInput.pipe(
		z.string().trim().min(1, 'Product name is required').max(200)
	),
	tagline: optionalStringInput.pipe(
		z
			.string()
			.max(500)
			.trim()
			.transform((v) => v || null)
	),
	description: optionalStringInput.pipe(
		z
			.string()
			.max(50_000)
			.trim()
			.transform((v) => v || null)
	),
	websiteUrl: optionalUrlField,
	logoUrl: optionalStringInput.pipe(
		z
			.string()
			.max(2000)
			.trim()
			.transform((value) => value || null)
	),
	integrationCustomerId: z.string().uuid().nullable().optional(),
	profileData: businessProfileDataFormSchema.optional().default({})
}) as z.ZodType<AutoLaunchProductProfileFormValues>;
