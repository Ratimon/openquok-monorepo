<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { getDateMetricUsStyle, newDayjs } from '$lib/utils/postingSchedulePreferences';

	type DelayOption = { seconds: number; label: string };

	type Props = {
		/** Delay in seconds between thread posts/replies. */
		value?: number;
		disabled?: boolean;
		options?: DelayOption[];
		onChange?: (nextSeconds: number) => void;
		/**
		 * `datetime-local` string for the main post (same as schedule picker). Used to show cumulative timing.
		 */
		scheduledPostDatetimeLocal?: string | null;
		/**
		 * This reply plus all prior replies’ delay values in order (seconds). Matches worker: wait then publish, chained.
		 */
		delayChainSeconds?: number[];
		/**
		 * Extra seconds per reply after each user delay (Threads: fixed wait in `threadsProvider.comment` before publish).
		 * Adds `value × delayChainSeconds.length` to the approximate clock.
		 */
		threadsPublishPrepareSecondsPerReply?: number;
	};

	let {
		value = $bindable(0),
		disabled = false,
		options = [
			{ seconds: 0, label: 'No delay' },
			{ seconds: 5, label: '5 seconds' },
			{ seconds: 10, label: '10 seconds' },
			{ seconds: 30, label: '30 seconds' },
			{ seconds: 60, label: '1 minute' },
			{ seconds: 5 * 60, label: '5 minutes' }
		],
		onChange,
		scheduledPostDatetimeLocal = null,
		delayChainSeconds = [],
		threadsPublishPrepareSecondsPerReply = 0
	}: Props = $props();

	let selected = $derived(String(value));

	function formatScheduledClock(datetimeLocal: string | null | undefined): string {
		const raw = (datetimeLocal ?? '').trim();
		if (!raw) return '';
		const d = newDayjs(raw);
		if (!d.isValid()) return '';
		return getDateMetricUsStyle() ? d.format('h:mm A') : d.format('HH:mm');
	}

	const cumulativeHint = $derived.by(() => {
		const chain = Array.isArray(delayChainSeconds) ? delayChainSeconds : [];
		if (chain.length === 0) return { line: '', title: '', approxClock: '' };

		const clock = formatScheduledClock(scheduledPostDatetimeLocal);
		const userParts = chain.map((s) => `${Number.isFinite(s) ? s : 0}s`).join(' + ');
		const preparePerReply = Number.isFinite(threadsPublishPrepareSecondsPerReply)
			? Math.max(0, threadsPublishPrepareSecondsPerReply)
			: 0;
		const threadsPrepareTotal = preparePerReply * chain.length;

		const threadsTail =
			preparePerReply > 0 && threadsPrepareTotal > 0
				? ` + ${preparePerReply}s×${chain.length} (Threads)`
				: '';
		const line = clock ? `${clock} + ${userParts}${threadsTail}` : `+ ${userParts}${threadsTail}`;

		const userSumSec = chain.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
		const sumSec = userSumSec + threadsPrepareTotal;
		let approxClock = '';
		if (clock) {
			const start = newDayjs((scheduledPostDatetimeLocal ?? '').trim());
			if (start.isValid()) {
				const end = start.add(sumSec, 'second');
				approxClock = getDateMetricUsStyle()
					? end.format('h:mm:ss A')
					: end.format('HH:mm:ss');
			}
		}

		const title =
			preparePerReply > 0
				? 'Each reply waits its delay after the previous step, then Threads waits ~30s before the reply appears. Clock uses your scheduled main post time.'
				: 'Each reply waits its delay after the previous step (main post or prior reply). Times use your scheduled post time from the panel below.';

		return { line, title, approxClock };
	});
</script>

<div
	class="flex flex-wrap items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 sm:flex-nowrap sm:gap-3"
>
	<div class="flex shrink-0 items-center gap-2 text-sm font-medium text-base-content/80">
		<AbstractIcon name={icons.MonitorPause.name} class="size-4" width="16" height="16" />
		<span>Delay</span>
	</div>

	{#if cumulativeHint.line}
		<div
			class="min-w-0 flex-1 text-center text-xs leading-snug text-base-content/60 sm:text-center"
			title={cumulativeHint.title}
		>
			<span class="block break-words tabular-nums sm:whitespace-nowrap">{cumulativeHint.line}</span>
			{#if cumulativeHint.approxClock}
				<span class="mt-0.5 block whitespace-nowrap text-[11px] text-base-content/50 tabular-nums">
					≈ {cumulativeHint.approxClock}
				</span>
			{/if}
		</div>
	{:else}
		<div class="min-w-0 flex-1"></div>
	{/if}

	<!-- DaisyUI `.select` often sets width: 100%; shrink to label width (+ padding). -->
	<div class="ml-auto shrink-0">
		<select
			class="select select-bordered select-sm !w-max max-w-[min(100%,12rem)]"
			disabled={disabled}
			bind:value={selected}
			onchange={() => {
				const next = Number(selected);
				if (Number.isFinite(next)) {
					value = next;
					onChange?.(next);
				}
			}}
		>
			{#each options as opt (opt.seconds)}
				<option value={String(opt.seconds)}>
					{opt.label}</option>
			{/each}
		</select>
	</div>
</div>

