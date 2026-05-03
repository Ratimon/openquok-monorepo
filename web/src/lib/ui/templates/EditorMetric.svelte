<script lang="ts">
	import { onMount } from 'svelte';

	import {
		applyPostingScheduleTimezoneDefaultFromStorage,
		getDateMetricUsStyle,
		getPostingScheduleTimezone,
		getTimeZoneSelectOptions,
		setDateMetricUsStyle,
		setPostingScheduleTimezone
	} from '$lib/utils/postingSchedulePreferences';

	import * as Select from '$lib/ui/select';

	const clockFormatChoices = [
		{ value: 'US', label: 'AM or PM' },
		{ value: 'GLOBAL', label: '24 hours' }
	] as const;

	let usStyle = $state(false);
	let timezoneValue = $state('UTC');
	let tzOptions = $state<{ value: string; label: string }[]>(getTimeZoneSelectOptions());

	function buildTzOptions(): { value: string; label: string }[] {
		const base = getTimeZoneSelectOptions();
		const current = getPostingScheduleTimezone();
		if (base.some((o) => o.value === current)) return base;
		return [{ value: current, label: current.replace(/_/g, ' ') }, ...base].sort((a, b) =>
			a.value.localeCompare(b.value, 'en')
		);
	}

	function syncFromStorage() {
		usStyle = getDateMetricUsStyle();
		timezoneValue = getPostingScheduleTimezone();
		tzOptions = buildTzOptions();
		applyPostingScheduleTimezoneDefaultFromStorage();
	}

	onMount(() => {
		syncFromStorage();
	});

	function onClockFormatChange(v: string | undefined) {
		const next = v === 'US';
		setDateMetricUsStyle(next);
		usStyle = next;
	}

	function onTimezoneChange(v: string | undefined) {
		if (!v) return;
		setPostingScheduleTimezone(v);
		timezoneValue = v;
	}
</script>

<section
	class="rounded-lg border border-base-300 bg-base-200 p-6 shadow-sm"
	aria-labelledby="date-metrics-heading"
>
	<h2 id="date-metrics-heading" class="text-lg font-semibold text-base-content">
		Date metrics
	</h2>
	<p class="mt-1 text-sm text-base-content/70">
		Clock format and timezone apply to posting schedules and time labels in this app. The timezone is
		stored in this browser and matches the Time table slots editor.
	</p>

	<div class="mt-6 flex flex-col gap-6">
		<div class="flex flex-col gap-2">
			<label class="text-sm font-medium text-base-content" for="editor-metric-clock">
				Clock format
			</label>
			<Select.Root
				type="single"
				value={usStyle ? 'US' : 'GLOBAL'}
				onValueChange={(v) => onClockFormatChange(v)}
			>
				<Select.Trigger id="editor-metric-clock" class="w-full max-w-md justify-between">
					{clockFormatChoices.find((c) => c.value === (usStyle ? 'US' : 'GLOBAL'))?.label ??
						'Choose format'}
				</Select.Trigger>
				<Select.Content>
					{#each clockFormatChoices as c (c.value)}
						<Select.Item value={c.value} label={c.label}>
							{c.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex flex-col gap-2">
			<label class="text-sm font-medium text-base-content" for="editor-metric-tz">
				Timezone
			</label>
			<select
				id="editor-metric-tz"
				class="select select-bordered bg-base-100 w-full max-w-md"
				value={timezoneValue}
				onchange={(e) => onTimezoneChange((e.currentTarget as HTMLSelectElement).value)}
			>
				{#each tzOptions as opt (opt.value)}
					<option value={opt.value}>
						{opt.label}</option>
				{/each}
			</select>
		</div>
	</div>
</section>
