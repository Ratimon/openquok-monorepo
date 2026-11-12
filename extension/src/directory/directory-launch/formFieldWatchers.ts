import type { AutoLaunchExtensionConfig, LaunchStepField } from 'openquok-common';

import { resolveFieldElement } from './fillEngine.js';

function tagChipWatchRoot(control: Element): Element | null {
	return control.closest('div, fieldset, li, section, form') ?? control.parentElement;
}

/**
 * Attach debounced `input` / `change` listeners (and tag-chip `MutationObserver`s)
 * for every resolvable field in `extension_config`. Returns a teardown function.
 */
export function wireLaunchFormWatchers(
	extensionConfig: AutoLaunchExtensionConfig,
	onFormChange: () => void
): () => void {
	const cleanups: Array<() => void> = [];
	const steps = extensionConfig.steps ?? [];

	for (const step of steps) {
		for (const field of step.fields ?? []) {
			const element = resolveFieldElement(field);
			if (!element) continue;

			const notify = () => onFormChange();
			element.addEventListener('input', notify);
			element.addEventListener('change', notify);
			cleanups.push(() => {
				element.removeEventListener('input', notify);
				element.removeEventListener('change', notify);
			});

			const root = tagChipWatchRoot(element);
			if (root) {
				const observer = new MutationObserver(() => onFormChange());
				observer.observe(root, {
					childList: true,
					subtree: true,
					characterData: true,
					attributes: true,
					attributeFilter: [
						'value',
						'checked',
						'aria-checked',
						'aria-valuetext',
						'data-value',
					],
				});
				cleanups.push(() => observer.disconnect());
			}
		}
	}

	return () => {
		for (const cleanup of cleanups) cleanup();
	};
}
