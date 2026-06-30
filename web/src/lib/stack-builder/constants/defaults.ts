import type { StackBuilderReferenceAsset } from '$lib/stack-builder/stackBuilder.types';

export const DEFAULT_AGENT_BUILDER_EXTENSION_SLUGS = ['openquok-core'] as const;

export const CHARACTER_BRIEF_TEMPLATE_JSON = `{
  "persona": "Y2K nostalgia creator",
  "voice": "playful, retro-futuristic, lowercase-friendly",
  "visual_style": "chrome gradients, pixel hearts, butterfly clips",
  "content_pillars": ["outfit checks", "room tours", "playlist drops"],
  "cta": "Follow for daily Y2K vibes"
}`;

export function createDefaultCharacterBriefAsset(): StackBuilderReferenceAsset {
	return {
		id: 'character-brief-template',
		type: 'json',
		label: 'Character brief template',
		payload: CHARACTER_BRIEF_TEMPLATE_JSON
	};
}
