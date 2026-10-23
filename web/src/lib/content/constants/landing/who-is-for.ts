import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import { icons } from '$data/icons';

const CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';

/** Default home-page WhoIsFor cards — shared with `/` JSON-LD and `LandingPage.svelte`. */
export const PUBLIC_LANDING_WHO_IS_FOR_CARDS: readonly AudienceCard[] = [
	{
		iconName: icons.CustomizedDrawnRobot.name,
		iconClass: 'text-emerald-400',
		title: 'Agentic',
		description:
			'Model-agnostic: OpenClaw, Hermes Agent, Grok Bot, Claude Duet, Meta Muse, and Dots. Schedule social posts and run auto launch. You approve each publish.',
		containerClass: CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.CustomizedDrawnLaptop.name,
		iconClass: 'text-lime-400',
		title: 'Developers',
		description:
			'Use the SDK, Public API, and CLI for social scheduling and auto launch. Post through official network APIs without getting banned.',
		containerClass: CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.CustomizedDrawnHouse.name,
		iconClass: 'text-rose-400',
		title: 'Social teams',
		description:
			'Plan social posts on one calendar. Auto launch submits directory listings from one workspace profile.',
		containerClass: CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Rocket.name,
		iconClass: 'text-sky-400',
		title: 'Startups',
		description:
			'Schedule launch posts and run auto launch for directory listings. One product profile powers both.',
		containerClass: CARD_CONTAINER_CLASS
	}
];
