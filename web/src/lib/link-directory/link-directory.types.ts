import { z } from 'zod';

export type LinkDirectoryEffort = 'easy' | 'medium' | 'hard';
export type LinkDirectoryApprovalMode = 'instant' | 'manual_review';
export type LinkDirectoryDofollow = 'dofollow' | 'nofollow' | 'unknown';
export type LinkDirectoryCostTier = 'free' | 'freemium' | 'paid';
export type LinkDirectoryCtaKind =
	| 'none'
	| 'connect_channel'
	| 'schedule_post'
	| 'use_plug'
	| 'external_doc';

export type BuildBacklinksSort =
	| 'dr_desc'
	| 'dr_asc'
	| 'visits_desc'
	| 'visits_asc'
	| 'title_asc'
	| 'title_desc';

export type BuildBacklinksHubFilters = {
	category?: string;
	tags?: string[];
	search?: string;
	sort: BuildBacklinksSort;
	costTiers?: LinkDirectoryCostTier[];
	dofollow?: LinkDirectoryDofollow[];
	effort?: LinkDirectoryEffort[];
	approvalMode?: LinkDirectoryApprovalMode[];
	opportunityTypeSlugs?: string[];
	bookmarkedOnly?: boolean;
};

export type LinkDirectoryOpportunityStepDto = {
	order: number;
	title: string;
	body: string;
};

export type LinkDirectoryOpportunityTypeDto = {
	id: string;
	slug: string;
	label: string;
	description: string | null;
	sortOrder: number;
};

export type LinkDirectoryOpportunityDto = {
	id: string;
	siteId: string;
	slug: string;
	title: string;
	opportunityTypeId: string;
	opportunityType: LinkDirectoryOpportunityTypeDto | null;
	effort: LinkDirectoryEffort;
	approvalMode: LinkDirectoryApprovalMode;
	approvalTimeHint: string | null;
	dofollow: LinkDirectoryDofollow;
	costTier: LinkDirectoryCostTier;
	costNote: string | null;
	description: string | null;
	steps: LinkDirectoryOpportunityStepDto[];
	openquokCtaKind: LinkDirectoryCtaKind;
	openquokChannelSlug: string | null;
	openquokPlugName: string | null;
	ctaHref: string | null;
	ctaLabel: string | null;
	sortOrder: number;
	isAdminPublished: boolean;
	publishedAt: string | null;
};

export type LinkDirectoryCategoryDto = {
	id: string;
	name: string;
	slug: string;
	headline: string | null;
	description: string | null;
	sortOrder: number;
	openquokChannelsHubPath: string;
};

export type LinkDirectoryTagDto = {
	id: string;
	name: string;
	slug: string;
	headline: string | null;
	description: string | null;
	groups: Array<{ id: string; name: string; sortOrder: number }>;
};

export type LinkDirectorySavedSiteDto = {
	id: string;
	siteId: string;
	sortOrder: number;
	createdAt: string;
	outreachCompletedAt: string | null;
	site: LinkDirectorySiteDto | null;
};

export type LinkDirectorySiteDto = {
	id: string;
	slug: string;
	title: string;
	siteUrl: string;
	logoUrl: string | null;
	shortDescription: string | null;
	longDescription: string | null;
	domainAuthority: number | null;
	domainRating: number | null;
	monthlyVisits: number | null;
	metricsSource: string | null;
	metricsUpdatedAt: string | null;
	categoryId: string | null;
	category: LinkDirectoryCategoryDto | null;
	isOpenquokAuthSupported: boolean;
	openquokChannelSlug: string | null;
	isAdminPublished: boolean;
	sortOrder: number;
	tagSlugs: string[];
	publishedAt: string | null;
	likes: number;
	views: number;
	bookmarkCount: number;
	averageRating: number;
	ratingsCount: number;
	opportunities: LinkDirectoryOpportunityDto[];
};

export type LinkDirectorySiteCommentDto = {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	updatedAt: string | null;
	parentId: string | null;
	userId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
};

export const linkDirectorySubmissionFormSchema = z.object({
	email: z.string().email('Enter a valid email address.').trim(),
	site_url: z.string().url('Enter a valid site URL (https://…).').trim(),
	proposed_title: z.string().max(500).optional().or(z.literal('')),
	notes: z.string().max(5000).optional().or(z.literal(''))
});

export type LinkDirectorySubmissionFormValues = z.infer<typeof linkDirectorySubmissionFormSchema>;
