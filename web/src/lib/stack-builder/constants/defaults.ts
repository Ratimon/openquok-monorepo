import type { StackBuilderReferenceAssetViewModel } from '$lib/stack-builder/stackBuilder.types';

export const DEFAULT_AGENT_BUILDER_EXTENSION_SLUGS = ['openquok-core'] as const;

export const SKILL_DEFAULT_NAME = 'my-first-skill';

export const SKILL_DEFAULT_TITLE = 'My First Skill';

export const SKILL_DEFAULT_DESCRIPTION = `A brief description of what this skill does and when to use it.
  Include keywords that someone might say when they need this skill.`;

export const SKILL_DEFAULT_VERSION = '1.0.0';

export const SKILL_DEFAULT_LICENSE = 'MIT';

/** Placeholder instructions when the workflow has no steps yet. */
export const SKILL_STARTER_INSTRUCTIONS = `Step-by-step instructions for the agent to follow.

### Step 1: Do the first thing

Details about step 1...

### Step 2: Do the next thing

Details about step 2...

### Step 3: Test it

Open your agent and try using your skill.`;

export const CREATING_SKILLS_DOC_URL = 'https://docs.openclaw.ai/tools/creating-skills';

export const CHARACTER_BRIEF_TEMPLATE_JSON = `{
  "persona": "Y2K nostalgia creator",
  "voice": "playful, retro-futuristic, lowercase-friendly",
  "visual_style": "chrome gradients, pixel hearts, butterfly clips",
  "content_pillars": ["outfit checks", "room tours", "playlist drops"],
  "cta": "Follow for daily Y2K vibes"
}`;

export function createDefaultCharacterBriefAsset(): StackBuilderReferenceAssetViewModel {
	return {
		id: 'character-brief-template',
		type: 'json',
		label: 'Character brief template',
		payload: CHARACTER_BRIEF_TEMPLATE_JSON
	};
}
