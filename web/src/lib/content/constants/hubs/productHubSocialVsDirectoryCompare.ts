import type { ComparePoint } from '$lib/ui/templates/Compare.svelte';

/** Fragment id for the hub Compare block (`#social-vs-directory-compare`). */
export const PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE_ID = 'social-vs-directory-compare';

export type PublicProductHubSocialVsDirectoryCompareSection = {
	schemaFragmentId: typeof PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE_ID;
	subtitle: string;
	title: string;
	description: string;
	leftTitle: string;
	rightTitle: string;
	points: ComparePoint[];
};

export const PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE = {
	schemaFragmentId: PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE_ID,
	subtitle: 'Social scheduling vs directory launch',
	title: 'social schedulers vs directory services match the page to your goal',
	description:
		'Social pages compare recurring posting tools — plans, channels, workspaces, and agent workflows. Directory pages compare one-time launch services — fees, pace, control, and outcomes. Pick the section above that fits your job.',
	leftTitle: 'Social media schedulers (Buffer, Later, Hootsuite, and peers)',
	rightTitle: 'Directory submission services (BoringLaunch, GetMoreBacklinks, and peers)',
	points: [
		{
			left: 'Recurring posts across connected social networks',
			right: 'One-time or batch directory and backlink packages'
		},
		{
			left: 'Calendar, approvals, and agent or API scheduling',
			right: 'Done-for-you listing pace or DIY launch with the extension'
		},
		{
			left: 'Monthly or per-seat software pricing',
			right: 'Per-site fees and delivery timelines in the report'
		},
		{
			left: 'Compare channels, workspaces, and programmatic access',
			right: 'Compare control, DR outcomes, and total launch cost'
		},
		{
			left: 'Head-to-head rows for Buffer, Later, and similar tools',
			right: 'Head-to-head rows for BoringLaunch and similar services'
		}
	]
} as const satisfies PublicProductHubSocialVsDirectoryCompareSection;
