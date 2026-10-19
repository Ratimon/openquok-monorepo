import type { PublicChannelFeatureSection } from '$lib/content/constants/channels/catalog/types';

export type DirectoryProductFeatureSectionHeader = {
	subtitle: string;
	title: string;
	description: string;
};

export type DirectoryProductFeatureSections = {
	feature1: DirectoryProductFeatureSectionHeader;
	feature2: DirectoryProductFeatureSectionHeader;
	feature3: DirectoryProductFeatureSectionHeader;
};

/** Copy for `/directory-submission-tool` product heroes (shared themes with channel PSEO). */
export const directorySubmissionToolProductFeatureSections: DirectoryProductFeatureSections =
	{
		feature1: {
			subtitle: 'One business profile',
			title: 'Fill once, use on every directory',
			description:
				'Save name, pitch, logo, and links in My Products. You pick each site. No fixed vendor list. Edit anytime and review on the next form.'
		},
		feature2: {
			subtitle: 'Workspaces and team',
			title: 'Invite by email, assign Member, manage seats by Admin',
			description:
				'Add Members by email. Admins manage seats. Everyone shares profiles and launch status in My Products.'
		},
		feature3: {
			subtitle: 'Per-directory fields',
			title: 'One main profile, tweak each site',
			description:
				'Set global copy once. Change tags, pricing, or limits per directory before autofill. Track submitted state and listing URLs in the same workspace.'
		}
	};

export type DirectoryChannelFeatureSectionsParams = {
	platformLabel: string;
	/** Platform-specific discovery fields phrase (e.g. "PeerPush categories"). */
	discoveryFieldsLabel: string;
	/** One or two short sentences for the autofill step (variants + submit on site). */
	autofillDescription: string;
};

/**
 * Shared three-row feature heroes for `/channels/{directory-slug}` PSEO pages.
 * Copy aligns with `/directory-submission-tool` product themes; bentos match the tool landing.
 */
export function buildDirectoryChannelFeatureSections(
	params: DirectoryChannelFeatureSectionsParams
): PublicChannelFeatureSection[] {
	const { platformLabel, discoveryFieldsLabel, autofillDescription } = params;

	return [
		{
			subtitle: 'One business profile',
			title: 'Fill once, reuse on every launch',
			description:
				`Save name, pitch, logo, and links in My Products. Add ${discoveryFieldsLabel} before you open ${platformLabel}. Fix gaps in the composer, not on the site form.`,
			bentoId: 'directory-profile-cases',
			mediaOnRight: true
		},
		{
			subtitle: 'Extension autofill',
			title: `Open ${platformLabel}, review fields, submit on the site`,
			description: autofillDescription,
			bentoId: 'directory-extension-autofill',
			mediaOnRight: false
		},
		{
			subtitle: 'Track submissions',
			title: 'Mark submitted, save the listing URL',
			description:
				`After you publish on ${platformLabel}, mark complete in OpenQuok. Store the live URL in My Products per variant.`,
			bentoId: 'directory-track-status',
			mediaOnRight: true
		}
	];
}
