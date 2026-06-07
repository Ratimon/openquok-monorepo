import { z } from 'zod';

import type { ModuleConfigSchema } from '$lib/config/constants/types';

const faqItemSchema = z.object({
	question: z.string(),
	answer: z.string()
});

/** Zod object for module config form values derived from admin module schema metadata. */
export function buildModuleConfigFormSchema(moduleSchema: ModuleConfigSchema) {
	return z.object(
		Object.fromEntries(
			Object.entries(moduleSchema).map(([key, schemaItem]) => {
				const isSwitch = schemaItem.inputType === 'switch' || schemaItem.type === 'boolean';
				if (isSwitch) {
					return [key, z.union([z.boolean(), z.string().transform((val) => val === 'true')])];
				}
				if (schemaItem.inputType === 'faq') {
					return [key, z.array(faqItemSchema)];
				}
				if (schemaItem.inputType === 'select') return [key, z.string()];
				if (schemaItem.inputType === 'textarea') return [key, z.string()];
				return [key, z.string()];
			})
		)
	);
}
