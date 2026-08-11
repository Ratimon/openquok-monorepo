<script lang="ts">
	import { onMount } from 'svelte';

	import type {
		BestTimeCalendarPreviewViewModel,
		BestTimeChannelHubLinkViewModel,
		ContentTypeId,
		PostingCadenceId,
		TimingTestPlanViewModel
	} from '$lib/best-time-to-post';
	import {
		BEST_TIME_FORM_DEFAULTS,
		buildBestTimeCalendarPreview,
		buildTimingTestPlan,
		CADENCE_OPTIONS,
		CONTENT_TYPE_OPTIONS
	} from '$lib/best-time-to-post';
	import { icons } from '$data/icons';

	import { toast } from '$lib/ui/sonner';
	import { getPostingScheduleTimezone } from '$lib/utils/postingSchedulePreferences';
	import PostingScheduleTimezoneSelect from '$lib/ui/components/settings/PostingScheduleTimezoneSelect.svelte';

	import { Badge } from '$lib/ui/badge';
	import Button from '$lib/ui/buttons/Button.svelte';
	import BestTimeToPostCalendarPreview from '$lib/ui/components/best-time-to-post/BestTimeToPostCalendarPreview.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/ui/select';

	type Props = {
		defaultPlatformSlug: string;
		channelLinksVm: BestTimeChannelHubLinkViewModel[];
	};

	let { defaultPlatformSlug, channelLinksVm }: Props = $props();

	/** User selection; null means follow `defaultPlatformSlug` from the page. */
	let platformOverride = $state<string | null>(null);
	let audienceTimezone = $state(BEST_TIME_FORM_DEFAULTS.timezone);
	let shownTimezone = $state(BEST_TIME_FORM_DEFAULTS.shownTimezone);
	let contentTypeId = $state<ContentTypeId>(BEST_TIME_FORM_DEFAULTS.contentTypeId);
	let cadenceId = $state<PostingCadenceId>(BEST_TIME_FORM_DEFAULTS.cadenceId);

	let plan = $state<TimingTestPlanViewModel | null>(null);
	let calendarPreview = $state<BestTimeCalendarPreviewViewModel | null>(null);
	let calendarPreviewInstanceId = $state(0);

	const platformSlug = $derived(
		platformOverride ??
			(defaultPlatformSlug.trim().toLowerCase() || BEST_TIME_FORM_DEFAULTS.platformSlug)
	);

	const platformLabel = $derived(
		channelLinksVm.find((c) => c.slug === platformSlug)?.platformLabel ?? platformSlug
	);

	const contentTypeLabel = $derived(
		CONTENT_TYPE_OPTIONS.find((o) => o.id === contentTypeId)?.label ?? contentTypeId
	);

	const cadenceLabel = $derived(CADENCE_OPTIONS.find((o) => o.id === cadenceId)?.label ?? cadenceId);

	onMount(() => {
		shownTimezone = getPostingScheduleTimezone();
	});

	function suggestTestSlots() {
		const next = buildTimingTestPlan({
			platformSlug,
			platformLabel,
			timezone: audienceTimezone,
			shownTimezone,
			contentTypeId,
			cadenceId
		});
		plan = next;
		calendarPreviewInstanceId += 1;
		calendarPreview = buildBestTimeCalendarPreview(next, calendarPreviewInstanceId);
	}

	async function copyOutput() {
		if (!plan?.plainText) {
			toast.error('Generate a timing test plan first.');
			return;
		}
		try {
			await navigator.clipboard.writeText(plan.plainText);
			toast.success('Timing test plan copied.');
		} catch {
			toast.error('Failed to copy.');
		}
	}
</script>

<div class="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-8">
	<section
		class="border-base-300 flex min-w-0 flex-col gap-5 rounded-2xl border bg-base-100 p-5 shadow-sm sm:p-6"
		aria-labelledby="best-time-inputs-heading"
	>
		<div class="flex items-start gap-3">
			<span
				class="grid size-10 shrink-0 place-items-center rounded-lg border border-base-300 bg-base-200/60"
				aria-hidden="true"
			>
				<AbstractIcon name={icons.Timer.name} width="20" height="20" class="size-5" focusable="false" />
			</span>
			<div>
				<h2 id="best-time-inputs-heading" class="text-lg font-semibold text-base-content">
					Test inputs
				</h2>
				<p class="text-base-content/65 mt-0.5 text-sm">
					Pick platform, audience and shown timezones — then generate benchmark
					test slots.
				</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="space-y-1.5">
				<label class="text-sm font-medium text-base-content" for="best-time-platform">Platform</label>
				<Select
					type="single"
					value={platformSlug}
					onValueChange={(v) => {
						if (v) platformOverride = v;
					}}
				>
					<SelectTrigger id="best-time-platform" class="border-base-300 w-full bg-base-100">
						<span class="truncate text-sm">{platformLabel}</span>
					</SelectTrigger>
					<SelectContent>
						{#each channelLinksVm as channelVm (channelVm.slug)}
							<SelectItem value={channelVm.slug}>{channelVm.platformLabel}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>

			<div class="space-y-1.5">
				<label class="text-sm font-medium text-base-content" for="best-time-audience-timezone">
					Audience timezone
				</label>
				<PostingScheduleTimezoneSelect
					id="best-time-audience-timezone"
					bind:value={audienceTimezone}
				/>
				<p class="text-base-content/55 text-xs">
					Where your viewers are — benchmark slots use local clock times in this zone (e.g.
					America/New_York).
				</p>
			</div>

			<div class="space-y-1.5">
				<label class="text-sm font-medium text-base-content" for="best-time-shown-timezone">
					Shown timezone
				</label>
				<PostingScheduleTimezoneSelect id="best-time-shown-timezone" bind:value={shownTimezone} />
				<p class="text-base-content/55 text-xs">
					Your local zone for the copied plan and week preview (e.g. Asia/Bangkok). Defaults to this
					browser’s Date metrics timezone.
				</p>
			</div>

			<div class="space-y-1.5">
				<label class="text-sm font-medium text-base-content" for="best-time-content-type">
					Content type
				</label>
				<Select
					type="single"
					value={contentTypeId}
					onValueChange={(v) => {
						if (v) contentTypeId = v as ContentTypeId;
					}}
				>
					<SelectTrigger id="best-time-content-type" class="border-base-300 w-full bg-base-100">
						<span class="truncate text-sm">{contentTypeLabel}</span>
					</SelectTrigger>
					<SelectContent>
						{#each CONTENT_TYPE_OPTIONS as option (option.id)}
							<SelectItem value={option.id}>{option.label}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>

			<div class="space-y-1.5">
				<label class="text-sm font-medium text-base-content" for="best-time-cadence">
					Posting days
				</label>
				<Select
					type="single"
					value={cadenceId}
					onValueChange={(v) => {
						if (v) cadenceId = v as PostingCadenceId;
					}}
				>
					<SelectTrigger id="best-time-cadence" class="border-base-300 w-full bg-base-100">
						<span class="truncate text-sm">{cadenceLabel}</span>
					</SelectTrigger>
					<SelectContent>
						{#each CADENCE_OPTIONS as option (option.id)}
							<SelectItem value={option.id}>{option.label}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>
		</div>

		<div class="mt-auto flex flex-wrap gap-2 pt-1">
			<Button variant="primary" type="button" onclick={suggestTestSlots}>Suggest test slots</Button>
		</div>
	</section>

	<section
		class="border-base-300 flex min-w-0 flex-col gap-4 rounded-2xl border bg-base-100 p-5 shadow-sm sm:p-6"
		aria-labelledby="best-time-output-heading"
	>
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex flex-wrap items-center gap-2">
				<Badge variant="blue">Timing test plan</Badge>
				<h2 id="best-time-output-heading" class="text-lg font-semibold text-base-content">
					Output
				</h2>
			</div>
			<Button
				variant="ghost"
				type="button"
				size="sm"
				disabled={!plan}
				onclick={copyOutput}
			>
				Copy output
			</Button>
		</div>

		{#if plan}
			<pre
				class="border-base-300 bg-base-200/50 text-base-content/90 max-h-[280px] overflow-auto rounded-xl border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap sm:text-sm"
			>{plan.plainText}</pre>
		{:else}
			<div
				class="border-base-300 bg-base-200/40 text-base-content/60 flex min-h-[160px] items-center justify-center rounded-xl border border-dashed px-4 text-center text-sm"
			>
				Click “Suggest test slots” to generate a numbered plan you can copy into your scheduler.
			</div>
		{/if}

		<div class="space-y-2">
			<p class="text-sm font-medium text-base-content">Week preview</p>
			<p class="text-base-content/60 text-xs">
				Read-only calendar in your shown timezone — same instants as the list above. Schedule in OpenQuok
				using the audience times when you publish.
			</p>
			<BestTimeToPostCalendarPreview preview={calendarPreview} />
		</div>
	</section>
</div>
