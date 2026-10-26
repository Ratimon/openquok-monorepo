import { directorySiteKeyFromProviderSlug } from 'openquok-common';

export type DirectoryChannelSummary = {
	identifier: string;
	name: string;
	tierLabel: 'Free' | 'Paid';
};

export type DirectoryChannelPickerOptions = {
	channels: DirectoryChannelSummary[];
	selectedId: string;
	/** When true (active launch), only `lockedId` stays selected and chips are not clickable. */
	locked: boolean;
	lockedId?: string | null;
	onSelect: (identifier: string) => void;
};

function variantLabel(name: string): string {
	const parts = name.split(/\s*[—–-]\s*/);
	if (parts.length > 1) return parts.slice(1).join(' — ').trim();
	return name.trim();
}

function variantInitials(name: string): string {
	const label = variantLabel(name);
	return label.slice(0, 2);
}

function siteIconUrl(siteKey: string): string {
	return chrome.runtime.getURL(`icons/link-directory/${siteKey}.svg`);
}

export function mountDirectoryChannelPicker(
	host: HTMLElement,
	opts: DirectoryChannelPickerOptions
): () => void {
	const { channels, locked, lockedId, onSelect } = opts;
	let selectedId = opts.selectedId;
	const cleanupFns: Array<() => void> = [];

	host.replaceChildren();

	const row = document.createElement('div');
	row.className = 'channel-picker directory-channel-picker';
	row.setAttribute('role', 'listbox');
	row.setAttribute('aria-label', 'Directory channel');

	for (const channel of channels) {
		const siteKey = directorySiteKeyFromProviderSlug(channel.identifier);
		const selected = selectedId === channel.identifier;
		const isLockedOther = locked && lockedId && channel.identifier !== lockedId;

		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'channel-picker-btn';
		btn.setAttribute('role', 'option');
		btn.setAttribute('aria-selected', selected ? 'true' : 'false');
		btn.title = channel.name;
		btn.setAttribute(
			'aria-label',
			`${channel.name} (${channel.tierLabel === 'Free' ? 'free tier' : 'paid tier'})`
		);
		if (selected) btn.classList.add('channel-picker-btn--selected');
		if (isLockedOther) {
			btn.classList.add('channel-picker-btn--disabled');
			btn.setAttribute('aria-disabled', 'true');
		}

		const chip = document.createElement('span');
		chip.className = 'directory-channel-chip';

		const tier = document.createElement('span');
		tier.className =
			channel.tierLabel === 'Free'
				? 'directory-channel-tier directory-channel-tier--free'
				: 'directory-channel-tier directory-channel-tier--paid';
		tier.textContent = channel.tierLabel;
		chip.appendChild(tier);

		const avatar = document.createElement('span');
		avatar.className = 'channel-avatar';
		if (selected) {
			avatar.classList.add('channel-avatar--selected');
		} else {
			avatar.classList.add('channel-avatar--muted');
		}

		const img = document.createElement('img');
		img.className = 'channel-avatar-img';
		img.alt = '';
		img.decoding = 'async';
		img.src = siteIconUrl(siteKey);
		img.addEventListener('error', () => {
			img.remove();
			if (!avatar.querySelector('.channel-avatar-initials')) {
				const initials = document.createElement('span');
				initials.className = 'channel-avatar-initials';
				initials.textContent = siteKey.slice(0, 2).toUpperCase();
				avatar.insertBefore(initials, avatar.firstChild);
			}
		});
		avatar.appendChild(img);

		const badge = document.createElement('span');
		badge.className = 'channel-badge directory-channel-variant-badge';
		badge.textContent = variantInitials(channel.name);
		avatar.appendChild(badge);

		chip.appendChild(avatar);
		btn.appendChild(chip);

		if (!isLockedOther) {
			const onClick = () => {
				if (locked && lockedId) return;
				selectedId = channel.identifier;
				for (const option of row.querySelectorAll<HTMLButtonElement>('.channel-picker-btn')) {
					const id = option.dataset.channelId;
					const isSelected = id === selectedId;
					option.classList.toggle('channel-picker-btn--selected', isSelected);
					option.setAttribute('aria-selected', isSelected ? 'true' : 'false');
					const av = option.querySelector('.channel-avatar');
					av?.classList.toggle('channel-avatar--selected', isSelected);
					av?.classList.toggle('channel-avatar--muted', !isSelected);
				}
				onSelect(channel.identifier);
			};
			btn.dataset.channelId = channel.identifier;
			btn.addEventListener('click', onClick);
			cleanupFns.push(() => btn.removeEventListener('click', onClick));
		}

		row.appendChild(btn);
	}

	host.appendChild(row);

	return () => {
		for (const fn of cleanupFns) fn();
		host.replaceChildren();
	};
}
