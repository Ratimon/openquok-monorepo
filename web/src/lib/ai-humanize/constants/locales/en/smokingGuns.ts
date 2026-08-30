import type { HumanizeSmokingGunEntry } from '$lib/ai-humanize/constants/writingGuide.types';

/**
 * Instant-kill leaks: scaffolding, self-reference, placeholders, tracking
 * params, email sign-offs in a social post, performative wrap-ups.
 */
export const HUMANIZE_SMOKING_GUNS: readonly HumanizeSmokingGunEntry[] = [
	{
		id: 'insertPlaceholder',
		label: 'bracket placeholders such as [insert example]',
		phrases: ['[insert example]', '[your name]', '[your company]', '[placeholder]'],
		pattern: /\[[^\]]*insert[^\]]*\]/gi
	},
	{
		id: 'selfReference',
		label: 'self-reference as a model or assistant',
		phrases: [
			'as an ai',
			'as a language model',
			"i'm an ai",
			'i am an ai',
			"i'm just an ai",
			'as an artificial intelligence'
		]
	},
	{
		id: 'trackingParam',
		label: 'leaked utm_source tracking params',
		pattern: /utm_source=[^\s&#]+/gi
	},
	{
		id: 'emailSignoff',
		label: 'email sign-offs in a social post',
		phrases: ['best regards', 'kind regards', 'warm regards', 'sincerely yours', 'yours truly']
	},
	{
		id: 'performativeHelp',
		label: 'performative wrap-ups',
		phrases: [
			'hope this helps',
			'happy to help',
			'glad to help',
			'let me know if you need anything else',
			'if you have any other questions',
			'is there anything else i can help'
		]
	},
	{
		id: 'loremIpsum',
		label: 'placeholder latin copy',
		phrases: ['lorem ipsum']
	}
];
