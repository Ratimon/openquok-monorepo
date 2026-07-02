import { nanoid } from 'nanoid';

import { OPENQUOK_COMMAND_WORKFLOW_META } from '$lib/stack-builder/constants/openquokCommandWorkflowMeta';
import { resolveOpenquokCommandTemplate } from '$lib/stack-builder/constants/openquokCliCommandSnippets';
import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';
import { defaultPostsCreatePayload } from '$lib/stack-builder/utils/postsCreatePayload';

export const OPENQUOK_CORE_EXTENSION_SLUG = 'openquok-core' as const;

export const DEFAULT_SKILL_BUILDER_EXTENSION_SLUGS = [OPENQUOK_CORE_EXTENSION_SLUG] as const;

export const OPENQUOK_CLI_GETTING_STARTED_URL = 'https://www.openquok.com/docs/getting-started-for-cli';

export const OPENQUOK_CORE_SKILL_SETUP_URL = 'https://www.openquok.com/docs/agent-setup-guides';

export const OPENQUOK_CLI_NPM_URL = 'https://www.npmjs.com/package/@openquok/auto-cli';

export const SKILL_DEFAULT_NAME = 'my-first-skill';

export const SKILL_DEFAULT_TITLE = 'My First Skill';

export const SKILL_DEFAULT_DESCRIPTION = `A brief description of what this skill does and when to use it.
  Include keywords that someone might say when they need this skill.`;

export const SKILL_DEFAULT_VERSION = '1.0.0';

export const SKILL_DEFAULT_LICENSE = 'MIT';

/** OpenQuok-focused starter steps for the Core Workflow panel. */
export const SKILL_STARTER_COMMAND_NAMES = [
	'integrations:list',
	'posts:create',
	'analytics:platform'
] as const;

/** Markdown fallback when every workflow step has been removed. */
export const SKILL_STARTER_CORE_WORKFLOW = `The fundamental pattern for using OpenQuok in this skill:

1. **Discover** — list integrations and pick channel UUIDs with \`openquok integrations:list\`
2. **Publish** — upload media when needed, then create or schedule posts with \`openquok posts:create\`
3. **Measure** — pull platform analytics with \`openquok analytics:platform\` and iterate on what works`;

export function createDefaultStarterWorkflowSteps(): StackBuilderWorkflowStepViewModel[] {
	return SKILL_STARTER_COMMAND_NAMES.map((commandName) => {
		const meta = OPENQUOK_COMMAND_WORKFLOW_META[commandName];
		return {
			id: nanoid(),
			type: 'command' as const,
			kind: 'cli' as const,
			listingSlug: OPENQUOK_CORE_EXTENSION_SLUG,
			listingTitle: 'OpenQuok Core',
			commandName,
			title: meta?.title ?? commandName,
			prompt: meta?.prompt ?? '',
			commandTemplate: resolveOpenquokCommandTemplate(commandName),
			examplePayload: commandName === 'posts:create' ? defaultPostsCreatePayload() : meta?.examplePayload
		};
	});
}

export const CREATING_SKILLS_DOC_URL = 'https://docs.openclaw.ai/tools/creating-skills';
