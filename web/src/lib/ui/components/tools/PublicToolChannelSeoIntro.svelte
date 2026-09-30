<script lang="ts">
	import { page } from '$app/state';

	import type { ChannelToolSeoIntro } from '$lib/content/constants/channels/tools/shared/channelToolContentOverride.types';
	import { prepareBlogRichTextForDisplay } from '$lib/blogs/utils';
	import { rewriteHtmlHostedMarketingHrefs } from '$lib/utils/hostedMarketingHref';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		intro: ChannelToolSeoIntro;
		/** When set, closing copy can link to an on-page anchor (e.g. calculator). */
		calculatorAnchorId?: string;
	};

	let { intro, calculatorAnchorId }: Props = $props();

	const closingHtml = $derived(
		intro.closingHtml
			? rewriteHtmlHostedMarketingHrefs(
					prepareBlogRichTextForDisplay(intro.closingHtml),
					page.url.origin
				)
			: null
	);

	const hasBenchmarkGrid = $derived(
		(intro.benchmarkTableRows?.length ?? 0) > 0
	);

	function timeTokens(row: { primaryTime: string; secondaryTimes?: string }): string[] {
		const tokens: string[] = [row.primaryTime];
		if (row.secondaryTimes) {
			for (const part of row.secondaryTimes.split(',')) {
				const trimmed = part.trim();
				if (trimmed) tokens.push(trimmed);
			}
		}
		return tokens;
	}

	function isWeekend(dayLabel: string): boolean {
		return dayLabel === 'Saturday' || dayLabel === 'Sunday';
	}

	const timeChipBase =
		'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums';

	function timeChipClasses(isPrimary: boolean): string {
		return isPrimary
			? `${timeChipBase} border-primary/25 bg-primary/12 text-base-content`
			: `${timeChipBase} border-base-content/12 bg-base-200/80 text-base-content/80`;
	}
</script>

<section
	class="overflow-hidden rounded-2xl border border-base-content/10 bg-base-200/35 shadow-sm"
	aria-labelledby="tool-channel-seo-intro-heading"
>
	<div
		class="border-b border-base-content/10 bg-base-100/50 px-4 py-4 sm:px-6 sm:py-5"
	>
		<div class="flex flex-wrap items-start gap-3">
			<div
				class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-base-content/10 bg-primary/10 text-primary"
			>
				<AbstractIcon
					name={hasBenchmarkGrid ? icons.CalendarClock.name : icons.Info.name}
					class="size-5"
					width="20"
					height="20"
				/>
			</div>
			<div class="min-w-0 flex-1 space-y-2">
				<h2
					id="tool-channel-seo-intro-heading"
					class="text-base font-semibold tracking-tight text-base-content sm:text-lg"
				>
					{intro.heading}
				</h2>
				{#each intro.paragraphs as paragraph (paragraph)}
					<p class="max-w-3xl text-sm leading-relaxed text-base-content/75 sm:text-[0.9375rem]">
						{paragraph}
					</p>
				{/each}
			</div>
		</div>

		{#if intro.highlights && intro.highlights.length > 0}
			<ul class="mt-4 grid gap-2 sm:grid-cols-3 sm:gap-3">
				{#each intro.highlights as item (item.title)}
					<li
						class="rounded-xl border border-base-content/10 bg-base-100/80 px-3 py-2.5 sm:px-4 sm:py-3"
					>
						<p class="text-xs font-medium uppercase tracking-wide text-base-content/55">
							{item.title}
						</p>
						<p class="mt-0.5 text-sm font-medium text-base-content">{item.subline}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#if hasBenchmarkGrid && intro.benchmarkTableRows}
		<div class="px-4 py-4 sm:px-6 sm:py-5">
			{#if intro.benchmarkTableCaption}
				<p class="mb-3 text-xs text-base-content/60">{intro.benchmarkTableCaption}</p>
			{/if}

			<ul class="space-y-1.5" role="list">
				{#each intro.benchmarkTableRows as row (row.dayLabel)}
					<li
						class="flex flex-col gap-2 rounded-xl border border-base-content/8 bg-base-100/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4"
					>
						<span
							class="text-sm font-semibold text-base-content sm:w-28 sm:shrink-0"
							class:text-primary={isWeekend(row.dayLabel)}
						>
							{row.dayLabel}
						</span>
						<div class="flex flex-wrap gap-1.5 sm:justify-end">
							{#each timeTokens(row) as token, i (token + String(i))}
								<span class={timeChipClasses(i === 0)}>
									{token}
								</span>
							{/each}
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if closingHtml || calculatorAnchorId}
		<div
			class="border-t border-base-content/10 bg-base-100/40 px-4 py-3 text-sm text-base-content/75 sm:px-6"
		>
			{#if closingHtml}
				<p class="prose prose-sm max-w-none prose-a:text-primary prose-strong:text-base-content">
					{@html closingHtml}
				</p>
			{:else if calculatorAnchorId}
				<p>
					<a href={`#${calculatorAnchorId}`} class="link link-primary font-medium">
						Jump to the timing test calculator
					</a>
					to build a week-by-week plan in your audience timezone.
				</p>
			{/if}
		</div>
	{/if}
</section>
