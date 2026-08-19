<script lang="ts">
	import type { GuestComposerLockAction } from '$lib/posts/constants/guestComposerLock';

	import { page } from '$app/state';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import DatePicker from '$lib/ui/components/posts/DatePicker.svelte';
	import SignInToComposerActionModal from '$lib/ui/components/posts/SignInToComposerActionModal.svelte';

	type Props = {
		isLoggedIn?: boolean;
		scheduledLocal?: string;
		saveDraftLabel?: string;
		primaryLabel?: string;
		class?: string;
	};

	let {
		isLoggedIn: isLoggedInProp,
		scheduledLocal = $bindable(''),
		saveDraftLabel = 'Save as draft',
		primaryLabel = 'Schedule Post',
		class: className = ''
	}: Props = $props();

	const isLoggedIn = $derived(
		isLoggedInProp ?? Boolean((page.data as { isLoggedIn?: boolean } | undefined)?.isLoggedIn)
	);

	let guestLockOpen = $state(false);
	let guestLockAction = $state<GuestComposerLockAction>('schedule');

	function openGuestLock(action: GuestComposerLockAction) {
		guestLockAction = action;
		guestLockOpen = true;
	}
</script>

<div
	class="pointer-events-auto flex flex-col gap-3 border-t border-base-300 bg-base-100/95 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end {className}"
>
	<DatePicker bind:value={scheduledLocal} disabled />
	<Button
		type="button"
		variant="secondary"
		class="gap-1.5"
		onclick={() => openGuestLock('draft')}
	>
		<AbstractIcon name={icons.Lock.name} class="size-4" width="16" height="16" />
		{saveDraftLabel}
	</Button>
	<Button
		type="button"
		variant="primary"
		class="gap-1.5"
		onclick={() => openGuestLock('schedule')}
	>
		<AbstractIcon name={icons.Lock.name} class="size-4" width="16" height="16" />
		{primaryLabel}
	</Button>
	<SignInToComposerActionModal bind:open={guestLockOpen} action={guestLockAction} {isLoggedIn} />
</div>
