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
			'Model-agnostic: use the assistant agents and models that work best or you already use.',
		containerClass: CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.CustomizedDrawnLaptop.name,
		iconClass: 'text-lime-400',
		title: 'Developers',
		description:
			'Fully open source: use OAuth, our SDK, and API to build your own content OS without writing your own APIs.',
		containerClass: CARD_CONTAINER_CLASS
	},
	{
		iconName: icons.CustomizedDrawnHouse.name,
		iconClass: 'text-rose-400',
		title: 'Scaling Team',
		description:
			'Reuse the viral formats that already work for you. Connect more social channels, and scale.',
		containerClass: CARD_CONTAINER_CLASS
	}
];
