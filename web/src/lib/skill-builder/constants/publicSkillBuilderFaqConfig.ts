import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

export type SkillBuilderFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
};

const PLATFORM_EXAMPLES_FAQ_TITLE =
	'What if I want examples for a specific platform (e.g. Facebook)?';

const GENERIC_SKILL_BUILDER_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		title: 'What is SKILL.md?',
		description:
			'SKILL.md is a markdown file with a short YAML header (name and description) and a body of step-by-step instructions — shell commands, prerequisites, and notes — that teach an AI agent how to run a repeatable workflow. Agents read the header at startup to decide when the skill applies, then load the full instructions when they invoke it.'
	},
	{
		title: 'How is a skill different from an MCP server?',
		description:
			'A skill is a playbook the agent reads: it tells the model what to do and which commands to run. An MCP server is a live tool connection over the Model Context Protocol (search, APIs, file ops, and more). Many setups use both — MCP for tools, SKILL.md for the recipe. OpenClaw and Hermes commonly install skills; Cursor, Claude Code, and Codex often wire MCP servers in config files.'
	},
	{
		title: 'Where can I use a SKILL.md file?',
		description:
			'Any agent host that supports the Agent Skills format: OpenClaw and Hermes Agent (skills folder or hermes skills install), Claude Code (.claude/skills/), Cursor (.cursor/skills/ or .agents/skills/), Codex (~/.agents/skills/), GitHub Copilot (.github/skills/), and others. Copy or install the exported file using your host’s layout — see OpenQuok agent setup guides for OpenClaw and Hermes, or MCP setup guides when you connect tools in Cursor or Claude Code.'
	},
	{
		title: 'Do I have to write SKILL.md by hand?',
		description:
			'No. Skill Builder provides the overview, prerequisites, workflow steps and the formatter from building blocks you pick. Preview and edit the markdown before you download — useful even if you have never written agent instructions before.'
	},
	{
		title: 'What does Skill Builder do?',
		description:
			'Pick building blocks from the skill/ MCP servers catalog, arrange CLI commands and notes in a workflow, and preview a SKILL.md file you can download or save as a playbook. It is open source and free to use — no workspace required to export.'
	},
	{
		title: 'Do I need an OpenQuok account to use it?',
		description:
			'No for editing and downloading SKILL.md. Sign in when you want to save or bookmark the MARKDOWN file in your account or you want to publish your skill to the catalog.'
	},
	{
		title: PLATFORM_EXAMPLES_FAQ_TITLE,
		description:
			'Stay on this page for a blank workflow, or scroll to the By channel section and pick a network — Facebook, Instagram, X, and others. Each channel page opens with openquok CLI steps already filled in for that platform: typical post commands, analytics recipes, and sample payloads you can edit before you export.'
	}
];

function tailorSkillBuilderFaqItem(
	item: PublicFaqItem,
	channelSlug: string,
	platformLabel: string
): PublicFaqItem {
	switch (item.title) {
		case 'What is SKILL.md?':
			return {
				title: item.title,
				description:
					`SKILL.md is a markdown file with a short YAML header (name and description) and a body of step-by-step instructions — shell commands, prerequisites, and notes — that teach an AI agent how to run repeatable ${platformLabel} workflows. This ${channelSlug} channel page pre-loads openquok CLI steps for ${platformLabel} so your exported skill is ready to edit. Agents read the header at startup to decide when the skill applies, then load the full instructions when they invoke it.`
			};
		case 'How is a skill different from an MCP server?':
			return {
				title: item.title,
				description:
					`A skill is a playbook the agent reads: it tells the model what to do and which commands to run — such as the ${platformLabel} posts:create recipes you compose here. An MCP server is a live tool connection over the Model Context Protocol (search, APIs, file ops, and more). Many setups use both — MCP for tools, SKILL.md for the recipe. OpenClaw and Hermes commonly install skills; Cursor, Claude Code, and Codex often wire MCP servers in config files.`
			};
		case 'Where can I use a SKILL.md file?':
			return {
				title: item.title,
				description:
					`Any agent host that supports the Agent Skills format: OpenClaw and Hermes Agent (skills folder or hermes skills install), Claude Code (.claude/skills/), Cursor (.cursor/skills/ or .agents/skills/), Codex (~/.agents/skills/), GitHub Copilot (.github/skills/), and others. Install the exported ${platformLabel} skill using your host’s layout — see OpenQuok agent setup guides for OpenClaw and Hermes, or MCP setup guides when you connect tools in Cursor or Claude Code.`
			};
		case 'Do I have to write SKILL.md by hand?':
			return {
				title: item.title,
				description:
					`No. This ${platformLabel} channel page starts with CLI workflow steps and example payloads for ${channelSlug}; Skill Builder adds the frontmatter, overview, prerequisites, and formatting from catalog building blocks you pick. Preview and edit the markdown before you download — useful even if you have never written agent instructions before.`
			};
		case 'What does Skill Builder do?':
			return {
				title: item.title,
				description:
					`Pick building blocks from the skill and MCP servers catalog, start from the pre-loaded ${platformLabel} workflow, arrange CLI commands and notes, and preview a SKILL.md file you can download or save as a playbook. It is open source and free to use — no workspace required to export.`
			};
		case 'Do I need an OpenQuok account to use it?':
			return item;
		case PLATFORM_EXAMPLES_FAQ_TITLE:
			return {
				title: `What's included for ${platformLabel}?`,
				description:
					`This page opens with a starter ${platformLabel} workflow so you are not building from scratch. You will see example commands for posting content, connecting your account, and checking analytics — the same recipes from our ${platformLabel} CLI examples. Edit any step, reorder them, or add skills and MCP building blocks from the catalog before you export. For another platform, pick a different channel in the By channel section.`
			};
		default:
			return item;
	}
}

function buildChannelSkillBuilderFaqItems(
	channelSlug: string,
	platformLabel: string
): PublicFaqItem[] {
	const slug = channelSlug.trim().toLowerCase();
	const label = platformLabel.trim();

	return GENERIC_SKILL_BUILDER_FAQ_ITEMS.map((item) =>
		tailorSkillBuilderFaqItem(item, slug, label)
	);
}

export function buildSkillBuilderFaqSection(
	channelSlug?: string | null,
	channelLabel?: string | null
): SkillBuilderFaqSection {
	const slug = channelSlug?.trim().toLowerCase();
	const label = channelLabel?.trim();

	if (slug && label) {
		return {
			faqSubtitle: 'Skill Builder FAQs',
			faqTitle: `${label} Skill builder, answered`,
			faqDescription: `What SKILL.md is, where to use it with OpenClaw, Hermes, Claude Code, and MCP hosts, and how to compose a ${label} skill with pre-loaded CLI steps.`,
			faqItems: buildChannelSkillBuilderFaqItems(slug, label)
		};
	}

	return {
		faqSubtitle: 'Skill Builder FAQs',
		faqTitle: 'Skill builder, answered',
		faqDescription:
			'What SKILL.md is, where to use it with OpenClaw, Hermes, Claude Code, and MCP hosts, and how Skill Builder helps you compose and export one.',
		faqItems: [...GENERIC_SKILL_BUILDER_FAQ_ITEMS]
	};
}
