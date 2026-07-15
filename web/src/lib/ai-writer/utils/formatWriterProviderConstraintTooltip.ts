import { socialProviderDisplayLabel } from '$data/social-providers';
import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers';

/**
 * Hover copy for an AI Writer Context chip: platform name + composer post limits
 * from {@link getLaunchProviderConfig}.
 */
export function formatWriterProviderConstraintTooltip(identifier: string): string {
	const id = identifier.trim();
	const label = socialProviderDisplayLabel(id);
	const cfg = getLaunchProviderConfig(id);
	const parts: string[] = [label];

	const max = cfg.maximumCharacters;
	if (id.toLowerCase() === 'x') {
		parts.push(`Max ${max.toLocaleString()} weighted characters`);
	} else {
		parts.push(`Max ${max.toLocaleString()} characters`);
	}

	if (cfg.minimumCharacters > 0) {
		parts.push(`Min ${cfg.minimumCharacters.toLocaleString()} characters`);
	}

	if (cfg.comments === 'no-media') {
		parts.push('Follow-ups: text only');
	} else if (cfg.comments === false) {
		parts.push('Follow-ups: not supported');
	}

	return parts.join(' · ');
}
