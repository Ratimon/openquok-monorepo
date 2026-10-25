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
			'Model-agnostic: AI agents on OpenClaw, Hermes Agent, Grok Bot, Dots, Meta Muse, ChatGPT, Claude, and Claude Code draft and schedule social posts. You approve each post before it publishes.',
		containerClass: CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.CustomizedDrawnLaptop.name,
		iconClass: 'text-lime-400',
		title: 'Developers',
		description:
			'Use open-source code, our SDK, Public API, and CLI. Post through official network APIs without building each integration yourself and not getting banned.',
		containerClass: CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.CustomizedDrawnHouse.name,
		iconClass: 'text-rose-400',
		title: 'Social teams',
		description:
			'Run a social media scheduler from one workspace. Plan posts on the calendar and share to every connected channel.',
		containerClass: CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.Rocket.name,
		iconClass: 'text-sky-400',
		title: 'Startups',
		description:
			'Submit product listings from one business profile. The browser extension autofills directory forms. You submit on each site.',
		containerClass: CARD_CONTAINER_CLASS
	}
];
