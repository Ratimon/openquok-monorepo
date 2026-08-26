import type { IntegrationMentionProgrammerModel } from '$lib/integrations';

import Mention from '@tiptap/extension-mention';

import { integrationsRepository } from '$lib/integrations/index';
import {
	COMPOSER_MENTION_MIN_QUERY_LENGTH,
	applyComposerMentionToRichEditor,
	providerSupportsComposerMentions
} from '$lib/posts/utils/composer';
import { createComposerMentionSuggestionRenderer } from '$lib/ui/components/posts/composer-editor/composerMentionSuggestionRenderer';

export type ComposerMentionExtensionConfig = {
	organizationId: string;
	integrationId: string;
	providerIdentifier: string;
};

const MENTION_SEARCH_DEBOUNCE_MS = 250;

/** TipTap Mention node + suggestion popup for markdown/html composer modes. */
export function buildComposerMentionExtension(config: ComposerMentionExtensionConfig) {
	if (!providerSupportsComposerMentions(config.providerIdentifier)) return null;

	const organizationId = config.organizationId.trim();
	const integrationId = config.integrationId.trim();
	const providerIdentifier = config.providerIdentifier;
	if (!organizationId || !integrationId) return null;

	return Mention.configure({
		HTMLAttributes: {
			class: 'composer-mention text-primary font-medium'
		},
		suggestion: {
			char: '@',
			allowedPrefixes: [' ', '\n'],
			debounce: MENTION_SEARCH_DEBOUNCE_MS,
			minQueryLength: COMPOSER_MENTION_MIN_QUERY_LENGTH,
			items: async ({ query }) => {
				if (query.length < COMPOSER_MENTION_MIN_QUERY_LENGTH) return [];
				const result = await integrationsRepository.searchIntegrationMentions(
					organizationId,
					integrationId,
					query
				);
				return result.ok ? result.mentions : [];
			},
			render: createComposerMentionSuggestionRenderer(),
			command: ({ editor, range, props }) => {
				applyComposerMentionToRichEditor(
					editor,
					range,
					providerIdentifier,
					props as IntegrationMentionProgrammerModel
				);
			}
		}
	});
}
