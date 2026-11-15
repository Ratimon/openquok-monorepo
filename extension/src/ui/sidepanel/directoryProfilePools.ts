import {
	AUTO_LAUNCH_MESSAGE_TYPE,
	listProfilePoolSections,
	type ProfilePoolFieldResolved,
	type ProfilePoolSection,
} from 'openquok-common';

import { isReadyPage, pageMatchesConfig } from '../../directory/directory-launch/stepRail.js';
import type { StoredAutoLaunchState } from '../../directory/auto-launch/sessionStorage.js';

import { escapeHtml, replaceElementHtml, runtimeSendMessage } from './uiHelpers.js';

export type DirectoryProfilePoolsOptions = {
	state: StoredAutoLaunchState;
	onError?: (message: string) => void;
};

/** Checkbox selections keyed by field id — survives side-panel re-renders. */
const selectedItemsByFieldId = new Map<string, Set<string>>();

function fieldSelectionKey(fieldId: string): Set<string> {
	let set = selectedItemsByFieldId.get(fieldId);
	if (!set) {
		set = new Set();
		selectedItemsByFieldId.set(fieldId, set);
	}
	return set;
}

function orderedSelectedValues(
	sections: ProfilePoolSection[],
	selection: Map<string, Set<string>>
): { values: string[]; profilePaths: string[] } {
	const values: string[] = [];
	const profilePaths = new Set<string>();

	for (const section of sections) {
		for (const field of section.fields) {
			if (field.kind !== 'string_array') continue;
			const picked = selection.get(field.id);
			if (!picked?.size) continue;
			let added = false;
			for (const item of field.items) {
				if (picked.has(item)) {
					values.push(item);
					added = true;
				}
			}
			if (added) profilePaths.add(field.profilePath);
		}
	}

	return { values, profilePaths: [...profilePaths] };
}

function sectionUsesLaunch(section: ProfilePoolSection): boolean {
	return section.fields.some((field) => field.highlighted);
}

function renderFieldRows(field: ProfilePoolFieldResolved): string {
	const highlighted = field.highlighted
		? '<span class="profile-pool-launch-badge" title="Used on this directory launch">Launch</span>'
		: '';

	if (field.kind === 'string_array') {
		const picked = fieldSelectionKey(field.id);
		const maxHint =
			field.maxItems !== undefined
				? `<span class="profile-pool-max muted">Up to ${field.maxItems} on profile</span>`
				: '';

		if (field.items.length === 0) {
			return `
				<div class="profile-pool-field ${field.highlighted ? 'profile-pool-field--highlighted' : ''}" data-field-id="${escapeHtml(field.id)}">
					<div class="profile-pool-field-head">
						<span class="profile-pool-field-label">${escapeHtml(field.label)}</span>
						${highlighted}
					</div>
					<p class="profile-pool-empty muted">No values in profile</p>
					${maxHint}
				</div>`;
		}

		const items = field.items
			.map((item, index) => {
				const checked = picked.has(item) ? 'checked' : '';
				const id = `pool-${field.id}-${index}`;
				return `
					<label class="profile-pool-check" for="${escapeHtml(id)}">
						<input type="checkbox" id="${escapeHtml(id)}" class="profile-pool-check-input" data-field-id="${escapeHtml(field.id)}" value="${escapeHtml(item)}" ${checked} />
						<span class="profile-pool-check-text">${escapeHtml(item)}</span>
					</label>`;
			})
			.join('');

		return `
			<div class="profile-pool-field ${field.highlighted ? 'profile-pool-field--highlighted' : ''}" data-field-id="${escapeHtml(field.id)}">
				<div class="profile-pool-field-head">
					<span class="profile-pool-field-label">${escapeHtml(field.label)}</span>
					${highlighted}
				</div>
				<div class="profile-pool-checks">${items}</div>
				${maxHint}
			</div>`;
	}

	if (field.kind === 'boolean') {
		if (field.booleanValue === null) {
			return `
				<div class="profile-pool-field ${field.highlighted ? 'profile-pool-field--highlighted' : ''}">
					<div class="profile-pool-field-head">
						<span class="profile-pool-field-label">${escapeHtml(field.label)}</span>
						${highlighted}
					</div>
					<p class="profile-pool-empty muted">Not set in profile</p>
				</div>`;
		}

		const value = field.booleanValue ? 'true' : 'false';
		const label = field.booleanValue ? 'Yes' : 'No';
		return `
			<div class="profile-pool-field ${field.highlighted ? 'profile-pool-field--highlighted' : ''}">
				<div class="profile-pool-field-head">
					<span class="profile-pool-field-label">${escapeHtml(field.label)}</span>
					${highlighted}
				</div>
				<div class="profile-pool-scalar-row">
					<span class="profile-pool-scalar-value">${escapeHtml(label)}</span>
					<button type="button" class="secondary profile-pool-fill-one" data-fill-value="${escapeHtml(value)}" data-profile-path="${escapeHtml(field.profilePath)}">Fill focused</button>
				</div>
			</div>`;
	}

	const scalar = field.value;
	if (!scalar) {
		return `
			<div class="profile-pool-field ${field.highlighted ? 'profile-pool-field--highlighted' : ''}">
				<div class="profile-pool-field-head">
					<span class="profile-pool-field-label">${escapeHtml(field.label)}</span>
					${highlighted}
				</div>
				<p class="profile-pool-empty muted">No value in profile</p>
			</div>`;
	}

	const display =
		field.kind === 'rich_text'
			? scalar.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) +
				(scalar.length > 120 ? '…' : '')
			: scalar;

	return `
		<div class="profile-pool-field ${field.highlighted ? 'profile-pool-field--highlighted' : ''}">
			<div class="profile-pool-field-head">
				<span class="profile-pool-field-label">${escapeHtml(field.label)}</span>
				${highlighted}
			</div>
			<div class="profile-pool-scalar-row">
				<span class="profile-pool-scalar-value" title="${escapeHtml(scalar)}">${escapeHtml(display)}</span>
				<button type="button" class="secondary profile-pool-fill-one" data-fill-value="${escapeHtml(scalar)}" data-profile-path="${escapeHtml(field.profilePath)}">Fill focused</button>
			</div>
		</div>`;
}

function renderSections(sections: ProfilePoolSection[]): string {
	return sections
		.map((section) => {
			const launchSection = sectionUsesLaunch(section);
			const badge = launchSection
				? '<span class="profile-pool-launch-badge profile-pool-launch-badge--section">For this launch</span>'
				: '';
			const open = launchSection ? 'open' : '';
			return `
				<details class="profile-pool-section" ${open}>
					<summary class="profile-pool-section-summary">
						<span>${escapeHtml(section.label)}</span>
						${badge}
					</summary>
					<div class="profile-pool-section-body">
						${section.fields.map((field) => renderFieldRows(field)).join('')}
					</div>
				</details>`;
		})
		.join('');
}

function canUseFocusedFill(state: StoredAutoLaunchState): boolean {
	const config = state.session.extensionConfig;
	return pageMatchesConfig(config) && isReadyPage(config);
}

async function sendFillFocused(payload: {
	values: string[];
	profilePath?: string;
	onError?: (message: string) => void;
}): Promise<void> {
	try {
		const response = (await runtimeSendMessage({
			type: AUTO_LAUNCH_MESSAGE_TYPE.FILL_FOCUSED,
			values: payload.values,
			fillMode: 'auto',
			...(payload.profilePath ? { profilePath: payload.profilePath } : {}),
		})) as { ok?: boolean; error?: string };
		if (response?.ok === false) {
			payload.onError?.(String(response.error ?? 'Focused fill failed.'));
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Focused fill failed.';
		payload.onError?.(message);
	}
}

export function mountDirectoryProfilePools(
	host: HTMLElement,
	opts: DirectoryProfilePoolsOptions
): () => void {
	const { state, onError } = opts;
	const cleanupFns: Array<() => void> = [];

	const sections = listProfilePoolSections(state.session.profileSnapshot, {
		extensionConfig: state.session.extensionConfig,
	});

	const ready = canUseFocusedFill(state);

	host.replaceChildren();
	const root = document.createElement('div');
	root.className = 'profile-pools';

	const lead = document.createElement('p');
	lead.className = 'muted profile-pools-lead';
	lead.textContent =
		'Green Launch badges = fields this directory expects. Click a form control on the directory tab, then Fill focused; or use Fill on the on-page step rail.';
	root.appendChild(lead);

	const sectionsHost = document.createElement('div');
	sectionsHost.className = 'profile-pools-sections';
	replaceElementHtml(sectionsHost, renderSections(sections));
	root.appendChild(sectionsHost);

	const fillBtn = document.createElement('button');
	fillBtn.type = 'button';
	fillBtn.id = 'profile-pools-fill-selected';
	fillBtn.textContent = 'Fill selected into focused field';
	fillBtn.disabled = true;
	if (!ready) {
		fillBtn.title = 'Open the directory submission form on the active tab first.';
	}
	root.appendChild(fillBtn);

	const fileHint = document.createElement('p');
	fileHint.className = 'muted profile-pools-file-hint';
	fileHint.textContent = 'Logo and gallery uploads: use Fill on the on-page step rail.';
	root.appendChild(fileHint);

	host.appendChild(root);

	const syncFillSelectedEnabled = (): void => {
		const { values } = orderedSelectedValues(sections, selectedItemsByFieldId);
		fillBtn.disabled = !ready || values.length === 0;
	};

	for (const input of host.querySelectorAll<HTMLInputElement>('.profile-pool-check-input')) {
		const onChange = () => {
			const fieldId = input.dataset.fieldId;
			const value = input.value;
			if (!fieldId || !value) return;
			const set = fieldSelectionKey(fieldId);
			if (input.checked) set.add(value);
			else set.delete(value);
			syncFillSelectedEnabled();
		};
		input.addEventListener('change', onChange);
		cleanupFns.push(() => input.removeEventListener('change', onChange));
	}

	syncFillSelectedEnabled();

	const onFillSelected = () => {
		const { values, profilePaths } = orderedSelectedValues(sections, selectedItemsByFieldId);
		if (!values.length || !ready) return;
		void sendFillFocused({
			values,
			profilePath: profilePaths.length === 1 ? profilePaths[0] : undefined,
			onError,
		});
	};
	fillBtn.addEventListener('click', onFillSelected);
	cleanupFns.push(() => fillBtn.removeEventListener('click', onFillSelected));

	for (const btn of host.querySelectorAll<HTMLButtonElement>('.profile-pool-fill-one')) {
		const onClick = () => {
			if (!ready) {
				onError?.('Open the directory submission form on the active tab first.');
				return;
			}
			const value = btn.dataset.fillValue;
			const profilePath = btn.dataset.profilePath;
			if (!value) return;
			void sendFillFocused({
				values: [value],
				profilePath,
				onError,
			});
		};
		btn.addEventListener('click', onClick);
		cleanupFns.push(() => btn.removeEventListener('click', onClick));
	}

	return () => {
		for (const fn of cleanupFns) fn();
		host.replaceChildren();
	};
}

/** @internal Test helper — reset persisted checkbox state. */
export function resetDirectoryProfilePoolsSelectionForTests(): void {
	selectedItemsByFieldId.clear();
}
