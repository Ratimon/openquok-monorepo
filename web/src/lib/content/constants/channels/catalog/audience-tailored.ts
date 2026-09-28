import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import { icons } from '$data/icons';

const TAILORED_CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';

/**
 * Optional fourth WhoIsFor card for channel landings (`/channels/{slug}`),
 * agent channel pages (`/agents/{agent}/{slug}`), and API platform pages.
 *
 * The first three cards stay in each channel seed (`audienceCards`).
 * Add or edit entries here when a platform needs a persona-specific fourth pillar.
 */
export const PUBLIC_CHANNEL_AUDIENCE_TAILORED_CARD_BY_SLUG: Readonly<
	Record<string, AudienceCard>
> = {
	bluesky: {
		iconName: icons.Globe.name,
		iconClass: 'text-sky-400',
		title: 'Federated & custom-PDS users',
		description:
			'Stay on bsky.social or run your own PDS. OpenQuok resolves your service URL at connect and schedules through your home server with an app password — not your main account password.',
		containerClass: TAILORED_CARD_CONTAINER_CLASS
	},
	linkedin: {
		iconName: icons.CustomizedDrawnLaptop.name,
		iconClass: 'text-sky-400',
		title: 'B2B go-to-market teams',
		description:
			'Run founder-led and company Page programs from one calendar. Batch thought leadership, launches, and exec amplification without spreadsheet handoffs.',
		containerClass: TAILORED_CARD_CONTAINER_CLASS
	}
};

export function getPublicChannelAudienceTailoredCard(
	slug: string
): AudienceCard | undefined {
	const key = slug.trim().toLowerCase();
	return PUBLIC_CHANNEL_AUDIENCE_TAILORED_CARD_BY_SLUG[key];
}

/** Merge base persona cards with an optional slug-specific fourth card. */
export function resolvePublicChannelAudienceCards(
	baseCards: readonly AudienceCard[],
	slug: string
): AudienceCard[] {
	const tailored = getPublicChannelAudienceTailoredCard(slug);
	if (!tailored) {
		return [...baseCards];
	}
	return [...baseCards, tailored];
}
