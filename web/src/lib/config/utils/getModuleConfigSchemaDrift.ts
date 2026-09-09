import type { ModuleConfigSchema } from '$lib/config/constants/types';

export type ModuleConfigSchemaDrift = {
	/** Schema keys with no non-empty value in stored config. */
	missingKeys: string[];
	/** Stored keys not present in the current schema. */
	obsoleteKeys: string[];
	/** Stored revision differs from the repository revision (or is missing). */
	revisionMismatch: boolean;
	storedRevision: string | null;
	codeRevision: string | null;
	isOutOfSync: boolean;
};

function isStoredValueEmpty(value: unknown): boolean {
	if (value == null) return true;
	if (typeof value === 'string') return value.trim() === '';
	if (Array.isArray(value)) return value.length === 0;
	return false;
}

/** Compare persisted module config against the git-managed schema (for admin drift warnings). */
export function getModuleConfigSchemaDrift(
	moduleSchema: ModuleConfigSchema,
	storedConfig: Record<string, unknown> | null | undefined,
	options?: {
		revisionConfigKey?: string;
		codeRevision?: string;
	}
): ModuleConfigSchemaDrift {
	const revisionConfigKey = options?.revisionConfigKey;
	const codeRevision = options?.codeRevision?.trim() || null;
	const schemaKeys = Object.keys(moduleSchema);
	const stored = storedConfig ?? {};

	const missingKeys = schemaKeys.filter((key) => {
		if (revisionConfigKey && key === revisionConfigKey) return false;
		return isStoredValueEmpty(stored[key]);
	});

	const obsoleteKeys = Object.keys(stored).filter((key) => !schemaKeys.includes(key));

	let storedRevision: string | null = null;
	let revisionMismatch = false;

	if (revisionConfigKey && codeRevision) {
		const raw = stored[revisionConfigKey];
		storedRevision =
			raw == null ? null : typeof raw === 'string' ? raw.trim() : String(raw).trim();
		revisionMismatch = storedRevision !== codeRevision;
	}

	const isOutOfSync =
		missingKeys.length > 0 || obsoleteKeys.length > 0 || revisionMismatch;

	return {
		missingKeys,
		obsoleteKeys,
		revisionMismatch,
		storedRevision,
		codeRevision,
		isOutOfSync
	};
}
