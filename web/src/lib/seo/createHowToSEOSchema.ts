import type { HowTo, HowToStep } from 'schema-dts';

export interface HowToStepInput {
	name: string;
	text: string;
}

export function createHowToSEOSchema(params: {
	canonicalUrl: string;
	/** URL fragment without `#` — defaults to `howto`. */
	fragmentId?: string;
	name: string;
	description?: string;
	steps: HowToStepInput[];
}): HowTo | Record<string, never> {
	const { canonicalUrl, fragmentId = 'howto', name, description, steps } = params;
	const trimmedName = name.trim();
	if (!trimmedName) return {};

	const howToSteps: HowToStep[] = steps
		.map((step, index) => {
			const stepName = step.name.trim();
			const stepText = step.text.trim();
			if (!stepName || !stepText) return null;
			return {
				'@type': 'HowToStep',
				position: index + 1,
				name: stepName,
				text: stepText
			} satisfies HowToStep;
		})
		.filter((step): step is HowToStep => step != null);

	if (howToSteps.length === 0) return {};

	return {
		'@type': 'HowTo',
		'@id': `${canonicalUrl}#${fragmentId}`,
		name: trimmedName,
		description: description?.trim() || undefined,
		url: canonicalUrl,
		step: howToSteps
	};
}
