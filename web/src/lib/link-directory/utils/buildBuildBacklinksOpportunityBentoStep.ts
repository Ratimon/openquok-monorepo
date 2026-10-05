import { icons, type IconName } from '$data/icons';

import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
import type { FeaturesOrderedStep } from '$lib/content/constants/agents/types';
import type { PublicChannelFeatureBentoId } from '$lib/content/constants/channels/catalog/feature-bento';
import type { LinkDirectoryOpportunityDto } from '$lib/link-directory/link-directory.types';
import { route } from '$lib/utils/path';

const CONNECT_CHANNELS_DOC = '/docs/channels/connect';
const PLUGS_DOC = '/docs/getting-started-for-public-api';
const EXTERNAL_SITE_PLACEHOLDER = 'external-site-placeholder' as const;

export type BuildBacklinksOpportunityBentoFields = Pick<
	FeaturesOrderedStep,
	| 'animatedContent'
	| 'deviceMock'
	| 'deviceMockContent'
	| 'mockUrl'
	| 'mediaAlt'
	| 'iconName'
> & {
	/** Channel landing bento (e.g. Facebook post editor) instead of Safari mock. */
	channelBentoId?: PublicChannelFeatureBentoId;
};

/** OpenQuok composer bentos for schedule_post sub-steps (draft / publish), by channel slug. */
const SCHEDULE_POST_CHANNEL_BENTO: Partial<Record<string, PublicChannelFeatureBentoId>> = {
	facebook: 'facebook-post-editor'
};

const SCHEDULE_POST_COMPOSER_STEP_ORDERS = new Set([2, 3]);

function resolveOpportunityMockUrl(
	opportunity: LinkDirectoryOpportunityDto,
	siteUrl?: string | null
): string | undefined {
	const ctaHref = opportunity.ctaHref?.trim();
	if (ctaHref) {
		return ctaHref;
	}
	const site = siteUrl?.trim();
	if (site) {
		return site;
	}
	return undefined;
}

function resolveSchedulePostMockUrl(channelSlug: string | null): string {
	const slug = channelSlug?.trim();
	if (slug) {
		return route(getRootPathPublicChannel(slug));
	}
	return CONNECT_CHANNELS_DOC;
}

function safariSectionMedia(
	mockUrl: string | undefined,
	mediaAlt: string,
	iconName: IconName
): BuildBacklinksOpportunityBentoFields {
	return {
		deviceMock: 'safari',
		deviceMockContent: EXTERNAL_SITE_PLACEHOLDER,
		...(mockUrl ? { mockUrl } : {}),
		mediaAlt,
		iconName
	};
}

/** Section-level Safari / device mock fields for a published opportunity. */
export function buildBuildBacklinksOpportunityBentoStep(
	opportunity: LinkDirectoryOpportunityDto,
	siteUrl?: string | null
): BuildBacklinksOpportunityBentoFields {
	const title = opportunity.title.trim() || 'Backlink opportunity';
	const mockUrl = resolveOpportunityMockUrl(opportunity, siteUrl);

	switch (opportunity.openquokCtaKind) {
		case 'connect_channel':
			return safariSectionMedia(
				mockUrl,
				`Connect ${opportunity.openquokChannelSlug ?? 'social'} channels in OpenQuok`,
				icons.Sparkles.name
			);
		case 'schedule_post':
			return safariSectionMedia(
				resolveOpportunityMockUrl(opportunity, siteUrl) ??
					resolveSchedulePostMockUrl(opportunity.openquokChannelSlug),
				'Schedule a social post from OpenQuok',
				icons.CalendarClock.name
			);
		case 'use_plug':
			return safariSectionMedia(
				PLUGS_DOC,
				'Plugs and automation in OpenQuok',
				icons.Link.name
			);
		case 'external_doc':
			return safariSectionMedia(
				opportunity.ctaHref?.trim() || '/docs',
				'OpenQuok setup documentation',
				icons.BookOpen.name
			);
		default:
			return safariSectionMedia(mockUrl, title, icons.Link.name);
	}
}

/**
 * Per sub-step media when the active step should differ from the section default
 * (e.g. Facebook Page post: Safari on step 1, composer bento on draft / publish steps).
 */
export function buildBuildBacklinksOpportunityStepMedia(
	opportunity: LinkDirectoryOpportunityDto,
	stepOrder: number,
	siteUrl?: string | null
): BuildBacklinksOpportunityBentoFields | undefined {
	if (opportunity.openquokCtaKind !== 'schedule_post') {
		return undefined;
	}

	const channelSlug = opportunity.openquokChannelSlug?.trim();
	const channelBentoId = channelSlug ? SCHEDULE_POST_CHANNEL_BENTO[channelSlug] : undefined;
	if (!channelBentoId) {
		return undefined;
	}

	if (SCHEDULE_POST_COMPOSER_STEP_ORDERS.has(stepOrder)) {
		return {
			channelBentoId,
			mediaAlt: 'Draft and schedule a Facebook Page post in OpenQuok',
			iconName: icons.CalendarClock.name
		};
	}

	if (stepOrder === 1) {
		return safariSectionMedia(
			resolveOpportunityMockUrl(opportunity, siteUrl) ??
				resolveSchedulePostMockUrl(opportunity.openquokChannelSlug),
			'Confirm your Facebook Page setup',
			icons.MousePointerClickIcon.name
		);
	}

	return undefined;
}
