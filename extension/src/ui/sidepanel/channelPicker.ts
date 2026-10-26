import {
	isSocialComposerChannel,
	type SocialIntegrationChannel,
	type SocialSessionContext,
} from '../../social/openquokSocialApi.js';
import {
	integrationIdsForGroup,
	isAllSchedulableSelected,
	listChannelGroups,
	schedulableComposerChannelIds,
} from '../../social/socialChannelSelection.js';
import {
	resolveIntegrationChannelAvatarSrc,
	retryIntegrationChannelAvatarSrc,
	revokeAvatarObjectUrls,
} from './integrationChannelAvatar.js';
import { getSocialProviderBadgeSvg } from './socialProviderBadgeSvg.js';

/** 20×20 plus glyph — matches dashboard composer dashed add chip (Lucide Plus proportions). */
const CHANNEL_ADD_PLUS_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';

const CHEVRON_DOWN_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

export type ChannelPickerOptions = {
	channels: SocialIntegrationChannel[];
	selectedIds: Set<string>;
	selectedGroupId: string | null;
	session: SocialSessionContext;
	onSelectionChange: (ids: Set<string>) => void;
	onSelectedGroupIdChange: (groupId: string | null) => void;
	onAddChannel: () => void;
};

type ChannelChipElements = {
	channel: SocialIntegrationChannel;
	btn: HTMLButtonElement;
	avatar: HTMLSpanElement;
};

function channelInitials(name: string): string {
	return name.trim().slice(0, 2);
}

function channelButtonTitle(channel: SocialIntegrationChannel, schedulable: boolean): string {
	if (schedulable) return channel.name;
	const reason = channel.unschedulableReason?.trim() || 'Reconnect required';
	return `${channel.name}: ${reason}`;
}

function canToggleChannel(channel: SocialIntegrationChannel, selectedIds: Set<string>): boolean {
	return isSocialComposerChannel(channel) || selectedIds.has(channel.id);
}

function applyChipSelectionState(chip: ChannelChipElements, selectedIds: Set<string>): void {
	const { channel, btn, avatar } = chip;
	const schedulable = isSocialComposerChannel(channel);
	const selected = selectedIds.has(channel.id);

	btn.classList.toggle('channel-picker-btn--selected', selected);
	btn.classList.toggle('channel-picker-btn--disabled', !schedulable && !selected);
	btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
	if (!schedulable && !selected) {
		btn.setAttribute('aria-disabled', 'true');
	} else {
		btn.removeAttribute('aria-disabled');
	}

	avatar.classList.toggle('channel-avatar--selected', selected);
	avatar.classList.toggle('channel-avatar--muted', !selected);
}

function applyAvatarImage(
	img: HTMLImageElement,
	channel: SocialIntegrationChannel,
	session: SocialSessionContext,
	isDestroyed: () => boolean
): void {
	const picture = channel.picture?.trim();
	if (!picture) return;

	void resolveIntegrationChannelAvatarSrc(session, channel).then((src) => {
		if (isDestroyed() || !src) return;
		img.hidden = false;
		img.src = src;
	});

	img.addEventListener('error', () => {
		const failedUrl = img.src;
		void retryIntegrationChannelAvatarSrc(session, channel, failedUrl).then((retrySrc) => {
			if (isDestroyed() || !retrySrc || retrySrc === failedUrl) return;
			img.src = retrySrc;
		});
	});
}

export function mountChannelPicker(host: HTMLElement, opts: ChannelPickerOptions): () => void {
	const { channels, session, onSelectionChange, onSelectedGroupIdChange, onAddChannel } = opts;
	const selectedIds = new Set(opts.selectedIds);
	let selectedGroupId = opts.selectedGroupId;
	let destroyed = false;
	const isDestroyed = () => destroyed;

	host.replaceChildren();

	const wrap = document.createElement('div');
	wrap.className = 'channel-picker-wrap';

	const toolbar = document.createElement('div');
	toolbar.className = 'channel-picker-toolbar';

	const selectAllLabel = document.createElement('label');
	selectAllLabel.className = 'channel-select-all';
	const selectAllInput = document.createElement('input');
	selectAllInput.type = 'checkbox';
	selectAllInput.className = 'channel-select-all-input';
	const selectAllText = document.createElement('span');
	selectAllText.textContent = 'Select all';
	selectAllLabel.append(selectAllInput, selectAllText);

	const groupRoot = document.createElement('div');
	groupRoot.className = 'channel-group-dropdown';
	groupRoot.setAttribute('data-group-dropdown-root', 'true');

	const groupBtn = document.createElement('button');
	groupBtn.type = 'button';
	groupBtn.className = 'channel-group-trigger';
	groupBtn.setAttribute('aria-haspopup', 'menu');
	groupBtn.setAttribute('aria-expanded', 'false');

	const groupBtnLabel = document.createElement('span');
	groupBtnLabel.className = 'channel-group-trigger-label';
	groupBtn.append(groupBtnLabel, document.createElement('span'));

	const groupMenu = document.createElement('div');
	groupMenu.className = 'channel-group-menu';
	groupMenu.hidden = true;
	groupMenu.setAttribute('role', 'menu');

	const groupMenuTitle = document.createElement('div');
	groupMenuTitle.className = 'channel-group-menu-title';
	groupMenuTitle.textContent = 'Groups';
	groupMenu.appendChild(groupMenuTitle);

	toolbar.append(selectAllLabel, groupRoot);
	groupRoot.append(groupBtn, groupMenu);

	const cleanupFns: Array<() => void> = [];
	let groupMenuOpen = false;

	function syncSelectAllCheckbox(): void {
		const schedulableCount = schedulableComposerChannelIds(channels).length;
		selectAllInput.disabled = schedulableCount === 0;
		selectAllInput.checked = isAllSchedulableSelected(channels, selectedIds);
	}

	function syncGroupTriggerLabel(): void {
		const groups = listChannelGroups(channels);
		if (!selectedGroupId) {
			groupBtnLabel.textContent = groups.length ? 'Select grouped channels' : 'Groups';
			return;
		}
		const name = groups.find((g) => g.id === selectedGroupId)?.name;
		groupBtnLabel.textContent = name ?? 'Select grouped channels';
	}

	function closeGroupMenu(): void {
		groupMenuOpen = false;
		groupMenu.hidden = true;
		groupBtn.setAttribute('aria-expanded', 'false');
	}

	function openGroupMenu(): void {
		groupMenuOpen = true;
		groupMenu.hidden = false;
		groupBtn.setAttribute('aria-expanded', 'true');
	}

	const groupMenuItems: HTMLButtonElement[] = [];

	function syncGroupMenuActiveStates(): void {
		for (const item of groupMenuItems) {
			const gid = item.dataset.groupId ?? '';
			const active = gid ? selectedGroupId === gid : !selectedGroupId;
			item.classList.toggle('channel-group-item--active', active);
		}
	}

	function mountGroupMenu(): void {
		groupMenu.replaceChildren(groupMenuTitle);
		groupMenuItems.length = 0;
		const groups = listChannelGroups(channels);
		groupRoot.hidden = groups.length === 0;

		const allBtn = document.createElement('button');
		allBtn.type = 'button';
		allBtn.className = 'channel-group-item';
		allBtn.dataset.groupId = '';
		allBtn.setAttribute('role', 'menuitem');
		allBtn.textContent = 'All groups';
		const onAll = () => {
			selectedGroupId = null;
			onSelectedGroupIdChange(null);
			syncGroupTriggerLabel();
			syncGroupMenuActiveStates();
			closeGroupMenu();
		};
		allBtn.addEventListener('click', onAll);
		cleanupFns.push(() => allBtn.removeEventListener('click', onAll));
		groupMenu.appendChild(allBtn);
		groupMenuItems.push(allBtn);

		for (const group of groups) {
			const item = document.createElement('button');
			item.type = 'button';
			item.className = 'channel-group-item';
			item.dataset.groupId = group.id;
			item.setAttribute('role', 'menuitem');
			item.textContent = group.name;
			const onPick = () => {
				selectedGroupId = group.id;
				const ids = integrationIdsForGroup(channels, group.id);
				selectedIds.clear();
				for (const id of ids) selectedIds.add(id);
				for (const entry of chips) {
					applyChipSelectionState(entry, selectedIds);
				}
				onSelectedGroupIdChange(group.id);
				onSelectionChange(new Set(selectedIds));
				syncSelectAllCheckbox();
				syncGroupTriggerLabel();
				syncGroupMenuActiveStates();
				closeGroupMenu();
			};
			item.addEventListener('click', onPick);
			cleanupFns.push(() => item.removeEventListener('click', onPick));
			groupMenu.appendChild(item);
			groupMenuItems.push(item);
		}
		syncGroupMenuActiveStates();
	}

	function emitSelectionChange(): void {
		onSelectionChange(new Set(selectedIds));
		syncSelectAllCheckbox();
	}

	const onSelectAllChange = () => {
		selectedGroupId = null;
		onSelectedGroupIdChange(null);
		selectedIds.clear();
		if (selectAllInput.checked) {
			for (const id of schedulableComposerChannelIds(channels)) selectedIds.add(id);
		}
		for (const entry of chips) {
			applyChipSelectionState(entry, selectedIds);
		}
		emitSelectionChange();
		syncGroupTriggerLabel();
		syncGroupMenuActiveStates();
	};
	selectAllInput.addEventListener('change', onSelectAllChange);
	cleanupFns.push(() => selectAllInput.removeEventListener('change', onSelectAllChange));

	const onGroupBtnClick = (e: MouseEvent) => {
		e.stopPropagation();
		if (groupMenuOpen) closeGroupMenu();
		else openGroupMenu();
	};
	groupBtn.addEventListener('click', onGroupBtnClick);
	cleanupFns.push(() => groupBtn.removeEventListener('click', onGroupBtnClick));

	const chevronHost = groupBtn.lastElementChild as HTMLElement;
	chevronHost.className = 'channel-group-trigger-chevron';
	chevronHost.innerHTML = CHEVRON_DOWN_SVG;

	const onDocClick = (e: MouseEvent) => {
		if (!groupMenuOpen) return;
		const target = e.target as HTMLElement | null;
		if (target?.closest('[data-group-dropdown-root]')) return;
		closeGroupMenu();
	};
	document.addEventListener('click', onDocClick, true);
	cleanupFns.push(() => document.removeEventListener('click', onDocClick, true));

	if (channels.length === 0) {
		const empty = document.createElement('p');
		empty.className = 'muted channel-picker-empty';
		empty.textContent = 'No social channels connected. Add channels in the dashboard.';
		wrap.append(toolbar, empty);
		host.appendChild(wrap);
		selectAllInput.disabled = true;
		groupRoot.hidden = true;
		return () => {
			destroyed = true;
			for (const fn of cleanupFns) fn();
			host.replaceChildren();
		};
	}

	const row = document.createElement('div');
	row.className = 'channel-picker';
	row.setAttribute('role', 'group');
	row.setAttribute('aria-label', 'Channels');

	const chips: ChannelChipElements[] = [];

	for (const channel of channels) {
		const schedulable = isSocialComposerChannel(channel);
		const selected = selectedIds.has(channel.id);

		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'channel-picker-btn';
		if (!schedulable && !selected) {
			btn.classList.add('channel-picker-btn--disabled');
		}
		if (selected) {
			btn.classList.add('channel-picker-btn--selected');
		}
		btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
		if (!schedulable && !selected) {
			btn.setAttribute('aria-disabled', 'true');
		}
		btn.setAttribute('aria-label', `Toggle channel ${channel.name}`);
		btn.title = channelButtonTitle(channel, schedulable);

		const avatar = document.createElement('span');
		avatar.className = 'channel-avatar';
		if (selected) {
			avatar.classList.add('channel-avatar--selected');
		} else {
			avatar.classList.add('channel-avatar--muted');
		}
		if (!schedulable) {
			avatar.classList.add('channel-avatar--unschedulable');
		}

		const picture = channel.picture?.trim();
		if (picture) {
			const img = document.createElement('img');
			img.className = 'channel-avatar-img';
			img.alt = '';
			img.decoding = 'async';
			img.hidden = true;
			avatar.appendChild(img);
			applyAvatarImage(img, channel, session, isDestroyed);
		} else {
			const initials = document.createElement('span');
			initials.className = 'channel-avatar-initials';
			initials.textContent = channelInitials(channel.name);
			avatar.appendChild(initials);
		}

		const badge = document.createElement('span');
		badge.className = 'channel-badge';
		badge.innerHTML = getSocialProviderBadgeSvg(channel.identifier);
		avatar.appendChild(badge);

		btn.appendChild(avatar);

		const chip: ChannelChipElements = { channel, btn, avatar };
		chips.push(chip);

		const onClick = () => {
			if (!canToggleChannel(channel, selectedIds)) return;
			if (selectedIds.has(channel.id)) selectedIds.delete(channel.id);
			else selectedIds.add(channel.id);
			if (selectedGroupId) {
				selectedGroupId = null;
				onSelectedGroupIdChange(null);
				syncGroupTriggerLabel();
				syncGroupMenuActiveStates();
			}
			for (const entry of chips) {
				applyChipSelectionState(entry, selectedIds);
			}
			emitSelectionChange();
		};
		btn.addEventListener('click', onClick);
		cleanupFns.push(() => btn.removeEventListener('click', onClick));

		row.appendChild(btn);
	}

	const addBtn = document.createElement('button');
	addBtn.type = 'button';
	addBtn.className = 'channel-picker-btn channel-add';
	addBtn.setAttribute('aria-label', 'Add channel');
	addBtn.title = 'Add channel in dashboard';
	const addAvatar = document.createElement('span');
	addAvatar.className = 'channel-avatar channel-add-avatar';
	addAvatar.innerHTML = CHANNEL_ADD_PLUS_SVG;
	addBtn.appendChild(addAvatar);
	const onAdd = () => onAddChannel();
	addBtn.addEventListener('click', onAdd);
	cleanupFns.push(() => addBtn.removeEventListener('click', onAdd));
	row.appendChild(addBtn);

	wrap.append(toolbar, row);
	host.appendChild(wrap);

	mountGroupMenu();
	syncSelectAllCheckbox();
	syncGroupTriggerLabel();

	return () => {
		destroyed = true;
		for (const fn of cleanupFns) fn();
		revokeAvatarObjectUrls();
		host.replaceChildren();
	};
}
