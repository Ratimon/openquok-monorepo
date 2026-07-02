export function getFieldErrorMessages(errors: unknown): string[] {
	if (!errors || !Array.isArray(errors)) return [];
	return errors
		.map((entry) =>
			typeof entry === 'string' ? entry : (entry as { message?: string }).message
		)
		.filter((message): message is string => !!message);
}

export function collectFormErrorMessages(formState: {
	errors: unknown[];
	fieldMeta?: Partial<Record<string, { errors?: unknown[] } | undefined>>;
}): string[] {
	const messages = new Set<string>();

	for (const errorMap of formState.errors) {
		if (!errorMap || typeof errorMap !== 'object') continue;
		for (const fieldErrors of Object.values(errorMap as Record<string, unknown>)) {
			for (const message of getFieldErrorMessages(fieldErrors)) {
				messages.add(message);
			}
		}
	}

	if (formState.fieldMeta) {
		for (const meta of Object.values(formState.fieldMeta)) {
			if (!meta) continue;
			for (const message of getFieldErrorMessages(meta.errors)) {
				messages.add(message);
			}
		}
	}

	return [...messages];
}
