import { z } from 'zod';

import type {
	AutoLaunchExtensionConfig,
	AutoLaunchProfileSnapshot
} from 'openquok-common';

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
	profileData: Record<string, unknown>;
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

export type AutoLaunchSubmissionDto = {
	id: string;
	organizationId: string;
	productProfileId: string;
	destinationId: string;
	status: string;
	listingUrl: string | null;
	intentCreatedAt: string | null;
	completedAt: string | null;
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

const optionalUrlField = z
	.string()
	.trim()
	.max(2000)
	.optional()
	.transform((value) => {
		if (!value) return null;
		return value;
	})
	.pipe(z.union([z.string().url('Enter a valid URL'), z.null()]));

export const autoLaunchProductProfileFormSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200).trim(),
	tagline: z.string().max(500).trim().optional().transform((v) => v?.trim() || null),
	description: z.string().max(50_000).optional().transform((v) => v?.trim() || null),
	websiteUrl: optionalUrlField,
	logoUrl: optionalUrlField,
	integrationCustomerId: z.string().uuid().nullable().optional()
});

export type AutoLaunchProductProfileFormValues = z.infer<typeof autoLaunchProductProfileFormSchema>;
