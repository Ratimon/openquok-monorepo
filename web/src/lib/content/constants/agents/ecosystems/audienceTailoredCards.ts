import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import { icons } from '$data/icons';

const CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';

/** Fourth WhoIsFor card keyed by agent-host slug. */
export const audienceTailoredCardByHostSlug: Readonly<Record<string, AudienceCard>> = {
	'meta-muse': {
		iconName: icons.MetaMuse.name,
		iconClass: 'text-sky-400',
		title: 'Meta-owned channels first',
		description:
			'Facebook, Instagram, and Threads are first-class for Meta Muse. You can still schedule every other supported network from the same OpenQuok workspace.',
		containerClass: CARD_CONTAINER_CLASS
	},
	openclaw: {
		iconName: icons.OpenClaw.name,
		iconClass: 'text-emerald-400',
		title: 'Open source on your Gateway',
		description:
			'Dots runs on OpenAI cloud computers. OpenClaw is open source — you self-host the Gateway and credentials.',
		containerClass: CARD_CONTAINER_CLASS
	},
	dots: {
		iconName: icons.Dots.name,
		iconClass: 'text-lime-400',
		title: 'ChatGPT-native cloud computers',
		description:
			'Dots are always-on agents on OpenAI-managed cloud computers with plugins and workplace chat. Choose OpenClaw when you need a self-hosted Gateway instead.',
		containerClass: CARD_CONTAINER_CLASS
	},
	'grok-bot': {
		iconName: icons.GrokBot.name,
		iconClass: 'text-rose-400',
		title: 'X as your home network',
		description:
			'Grok Bot fits xAI’s cloud computer and many named Bots. X is first-class; connect other networks in OpenQuok when you need them.',
		containerClass: CARD_CONTAINER_CLASS
	},
	gemini: {
		iconName: icons.Gemini.name,
		iconClass: 'text-sky-400',
		title: 'Gemini-first in Google’s toolchain',
		description:
			'Gemini Task connects OpenQuok through Connected Apps (MCP). YouTube is a natural first channel for video and Shorts. You can still schedule every other supported network from the same workspace.',
		containerClass: CARD_CONTAINER_CLASS
	},
	'claude-duet': {
		iconName: icons.ClaudeDuet.name,
		iconClass: 'text-orange-400',
		title: 'Professionals who live in Claude',
		description:
			'You are on Claude Pro or Max and want a proactive partner on your phone—not another terminal or desktop pane. Duet fits briefs and background tasks; OpenQuok keeps social publishes on your approval list.',
		containerClass: CARD_CONTAINER_CLASS
	}
};

/** Fourth WhoIsFor card keyed by MCP client slug. */
export const audienceTailoredCardByMcpSlug: Readonly<Record<string, AudienceCard>> = {
	'muse-code': {
		iconName: icons.MuseCode.name,
		iconClass: 'text-sky-400',
		title: 'Meta-owned channels first',
		description:
			'Facebook, Instagram, and Threads are first-class for Muse Code. You can still schedule every other supported network from the same OpenQuok workspace.',
		containerClass: CARD_CONTAINER_CLASS
	},
	'grok-build': {
		iconName: icons.GrokBuild.name,
		iconClass: 'text-rose-400',
		title: 'X as your home network',
		description:
			'Grok Build fits xAI’s terminal coding agent. X is first-class; connect other networks in OpenQuok when you need them.',
		containerClass: CARD_CONTAINER_CLASS
	},
	'android-studio': {
		iconName: icons.AndroidStudio.name,
		iconClass: 'text-emerald-400',
		title: 'Gemini-first in Google’s toolchain',
		description:
			'Connect OpenQuok MCP in Android Studio Agent mode. YouTube is a natural first channel for video and Shorts. You can still schedule every other supported network from the same workspace.',
		containerClass: CARD_CONTAINER_CLASS
	},
	'antigravity-cli': {
		iconName: icons.Antigravity.name,
		iconClass: 'text-blue-400',
		title: 'Gemini-first in Google’s toolchain',
		description:
			'Connect OpenQuok in Antigravity CLI for Gemini in your terminal. YouTube is a natural first channel for video and Shorts. You can still schedule every other supported network from the same workspace.',
		containerClass: CARD_CONTAINER_CLASS
	},
	'claude-code': {
		iconName: icons.ClaudeGlyph.name,
		iconClass: 'text-orange-400',
		title: 'Claude lab in one workspace',
		description:
			'Claude Code fits terminal and repo sessions with claude mcp add. Claude Duet is the proactive app with a virtual machine. You can still schedule every other supported network from the same workspace.',
		containerClass: CARD_CONTAINER_CLASS
	},
	'claude-cowork': {
		iconName: icons.Claude.name,
		iconClass: 'text-orange-400',
		title: 'Claude lab in one workspace',
		description:
			'Claude Cowork fits desktop cowork with custom connectors. Claude Duet is the proactive mobile and web agent. You can still schedule every other supported network from the same workspace.',
		containerClass: CARD_CONTAINER_CLASS
	}
};
