<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';

	import { protectedDashboardPagePresenter } from '$lib/area-protected';
	import { icons } from '$data/icons';
	import {
		getDateMetricUsStyle,
		getPostingScheduleTimezone
	} from '$lib/utils/postingSchedulePreferences';

	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { toast } from '$lib/ui/sonner';

	dayjs.extend(utc);
	dayjs.extend(timezone);

	function storedMinutesFromWallClock(hour: number, minute: number, tz: string): number {
		const offsetMin = dayjs.tz(dayjs(), tz).utcOffset();
		return hour * 60 + minute - offsetMin;
	}

	function formatStoredPostingMinutes(
		storedMinutes: number,
		tz: string,
		twelveHour: boolean
	): string {
		const d = dayjs.utc().startOf('day').add(storedMinutes, 'minute').tz(tz);
		return twelveHour ? d.format('hh:mm A') : d.format('HH:mm');
	}

	type Props = {
		open?: boolean;
		integration: CreateSocialPostChannelViewModel | null;
	};

	let { open = $bindable(false), integration }: Props = $props();

	const hourChoices = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
	const minuteChoices = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

	let draftMinutes = $state<number[]>([]);
	let baselineMinutes = $state<number[]>([]);
	let hourSel = $state('09');
	let minuteSel = $state('00');
	let busy = $state(false);
	let confirmCloseOpen = $state(false);
	/** Snapshot when the modal opens so list labels stay stable if the user changes system time mid-edit. */
	let scheduleTz = $state('UTC');
	/** Matches Global → Date metrics → “AM or PM” vs “24 hours” when the modal was opened. */
	let clockUsStyle = $state(false);

	const dirty = $derived(
		JSON.stringify([...draftMinutes].sort((a, b) => a - b)) !==
			JSON.stringify([...baselineMinutes].sort((a, b) => a - b))
	);

	const displayRows = $derived.by(() => {
		const tz = scheduleTz;
		const twelve = clockUsStyle;
		return [...draftMinutes]
			.map((value) => ({
				value,
				formatted: formatStoredPostingMinutes(value, tz, twelve)
			}))
			.sort((a, b) => a.value - b.value);
	});

	$effect(() => {
		if (open && integration) {
			const m = integration.postingTimes.map((s) => s.time);
			baselineMinutes = [...m];
			draftMinutes = [...m];
			hourSel = '09';
			minuteSel = '00';
			busy = false;
			confirmCloseOpen = false;
			scheduleTz = getPostingScheduleTimezone();
			clockUsStyle = getDateMetricUsStyle();
		}
		if (!open) {
			busy = false;
			confirmCloseOpen = false;
		}
	});

	$effect(() => {
		if (typeof window === 'undefined' || !open) return;
		const onBeforeUnload = (e: BeforeUnloadEvent) => {
			if (!dirty) return;
			e.preventDefault();
		};
		window.addEventListener('beforeunload', onBeforeUnload);
		return () => window.removeEventListener('beforeunload', onBeforeUnload);
	});

	function handleMainOpenChange(next: boolean) {
		if (!next && dirty) {
			confirmCloseOpen = true;
			queueMicrotask(() => {
				open = true;
			});
			return;
		}
		open = next;
	}

	function addSlot() {
		const h = Number(hourSel);
		const m = Number(minuteSel);
		if (!Number.isFinite(h) || !Number.isFinite(m)) return;
		const total = storedMinutesFromWallClock(h, m, scheduleTz);
		if (draftMinutes.includes(total)) {
			toast.error('This time is already scheduled.');
			return;
		}
		draftMinutes = [...draftMinutes, total].sort((a, b) => a - b);
	}

	function removeSlot(m: number) {
		if (typeof window !== 'undefined' && !window.confirm('Remove this time slot?')) return;
		draftMinutes = draftMinutes.filter((x) => x !== m);
	}

	async function save() {
		if (!integration) return;
		if (draftMinutes.length < 1) {
			toast.error('Add at least one time slot.');
			return;
		}
		const payload = [...draftMinutes].sort((a, b) => a - b).map((time) => ({ time }));
		busy = true;
		try {
			const resultVm = await protectedDashboardPagePresenter.setPostingTimes(integration.id, payload);
			if (resultVm.ok) {
				toast.success('Time slots saved.');
				baselineMinutes = [...draftMinutes].sort((a, b) => a - b);
				open = false;
			} else {
				toast.error(resultVm.error);
			}
		} finally {
			busy = false;
		}
	}

	function confirmDiscardAndClose() {
		confirmCloseOpen = false;
		draftMinutes = [...baselineMinutes];
		open = false;
	}

	function cancelDiscard() {
		confirmCloseOpen = false;
	}

	$effect(() => {
		if (typeof window === 'undefined' || !open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return;
			if (confirmCloseOpen) {
				e.preventDefault();
				cancelDiscard();
				return;
			}
			e.preventDefault();
			handleMainOpenChange(false);
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

<Dialog.Root bind:open onOpenChange={handleMainOpenChange}>
	<Dialog.Content class="max-w-md" showCloseButton={false}>
		<div class="flex items-start justify-between gap-3">
			<Dialog.Header class="space-y-1 text-start">
				<Dialog.Title>Time table slots</Dialog.Title>
				{#if integration}
					<Dialog.Description class="text-sm text-base-content/70">
						{integration.name}
					</Dialog.Description>
				{/if}
			</Dialog.Header>
			<button
				type="button"
				class="ring-offset-base-100 text-base-content/70 hover:text-base-content focus:ring-primary -mt-1 rounded-xs p-1 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
				aria-label="Close"
				disabled={busy}
				onclick={() => handleMainOpenChange(false)}
			>
				<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
			</button>
		</div>

		<div class="border-base-300 bg-base-200/30 mt-4 space-y-3 rounded-lg border p-4">
			<div class="text-base-content flex items-center gap-2 text-sm font-medium">
				<AbstractIcon name={icons.CalendarClock.name} class="size-4 shrink-0" width="16" height="16" />
				Add time slot
			</div>
			<div class="flex flex-wrap items-end gap-2">
				<div class="min-w-0 flex-1 space-y-1">
					<label class="text-xs font-medium text-base-content/70" for="tt-hour">
						Hour</label>
					<select
						id="tt-hour"
						class="select select-bordered select-sm w-full min-w-[4.5rem] bg-base-100"
						bind:value={hourSel}
						disabled={busy || !integration}
					>
						{#each hourChoices as h (h)}
							<option value={h}>
								{h}</option>
						{/each}
					</select>
				</div>
				<div class="min-w-0 flex-1 space-y-1">
					<label class="text-xs font-medium text-base-content/70" for="tt-min">
						Minutes</label>
					<select
						id="tt-min"
						class="select select-bordered select-sm w-full min-w-[4.5rem] bg-base-100"
						bind:value={minuteSel}
						disabled={busy || !integration}
					>
						{#each minuteChoices as mm (mm)}
							<option value={mm}>
								{mm}</option>
						{/each}
					</select>
				</div>
				<Button
					type="button"
					variant="primary"
					size="sm"
					class="shrink-0 gap-1"
					disabled={busy || !integration}
					onclick={addSlot}
				>
					<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
					Add
				</Button>
			</div>
		</div>

		<div class="mt-5">
			<h3 class="text-sm font-semibold text-base-content">
				Scheduled times ({displayRows.length})
			</h3>
			{#if displayRows.length === 0}
				<p class="text-base-content/60 mt-2 text-sm">
					No time slots added yet.</p>
			{:else}
				<ul class="mt-2 space-y-2">
					{#each displayRows as row (row.value)}
						<li
							class="border-base-300 bg-base-200/40 group flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5"
						>
							<div class="flex min-w-0 items-center gap-2">
								<span class="bg-primary inline-block size-2 shrink-0 rounded-full" aria-hidden="true"></span>
								<span class="text-sm font-medium tabular-nums text-base-content">{row.formatted}</span>
							</div>
							<button
								type="button"
								class="text-error/80 hover:text-error shrink-0 rounded-md p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary"
								aria-label="Remove time"
								disabled={busy}
								onclick={() => removeSlot(row.value)}
							>
								<AbstractIcon name={icons.Trash.name} class="size-4" width="16" height="16" />
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<Button
			type="button"
			variant="primary"
			class="mt-6 w-full"
			disabled={busy || !integration || draftMinutes.length < 1}
			onclick={() => void save()}
		>
			{#if busy}
				<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
			{:else}
				Save changes
			{/if}
		</Button>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={confirmCloseOpen}>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Are you sure?</Dialog.Title>
			<Dialog.Description>Are you sure you want to close this modal?</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="mt-4 flex flex-wrap gap-2 sm:justify-end">
			<Button
				type="button"
				variant="primary"
				class="min-w-[4.5rem]"
				onclick={confirmDiscardAndClose}
			>
				Yes
			</Button>
			<Button
				type="button"
				variant="primary"
				class="min-w-[4.5rem]"
				onclick={cancelDiscard}
			>
				No
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
