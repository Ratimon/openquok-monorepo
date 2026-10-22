<script lang="ts">
	import DirectorySeoDrHistoryChart from '$lib/ui/components/directory-analytics/DirectorySeoDrHistoryChart.svelte';
	import {
		formatDirectorySeoDelta,
		formatDirectorySeoDr
	} from '$lib/directory-seo/formatDirectorySeoDisplay';
	import { directorySeoChartColorAt } from '$lib/directory-seo/directorySeoChartColors';

	import {
		LANDING_DIRECTORY_ANALYTICS_MOCK_COMPETITORS,
		LANDING_DIRECTORY_ANALYTICS_MOCK_PRODUCT,
		LANDING_DIRECTORY_ANALYTICS_MOCK_SERIES
	} from '$lib/ui/templates/bento/minor-templates/landing/landingDirectoryAnalyticsMock';
</script>

<div class="select-none bg-base-100 text-base-content" aria-hidden="true">
	<div class="border-b border-base-300 px-4 py-3">
		<p class="text-xs font-medium tracking-wide text-base-content/50 uppercase">Directory analytics</p>
		<p class="mt-1 text-sm font-semibold">Domain rating</p>
	</div>

	<div class="space-y-4 p-4 sm:p-5">
		<div class="grid gap-3 sm:grid-cols-3">
			<div class="rounded-xl border border-base-300/90 bg-base-200/25 px-3 py-3 sm:col-span-1">
				<p class="text-[0.65rem] font-semibold tracking-wide text-base-content/55 uppercase">
					Your domain DR
				</p>
				<p class="mt-1 text-2xl font-bold tabular-nums">
					{formatDirectorySeoDr(LANDING_DIRECTORY_ANALYTICS_MOCK_PRODUCT.domainRating)}
				</p>
				<p class="mt-0.5 truncate text-xs text-base-content/55">
					{LANDING_DIRECTORY_ANALYTICS_MOCK_PRODUCT.domain}
				</p>
				<p class="mt-1 text-xs font-medium text-success">
					30d {formatDirectorySeoDelta(LANDING_DIRECTORY_ANALYTICS_MOCK_PRODUCT.delta30Days)}
				</p>
			</div>
			<div class="rounded-xl border border-base-300/90 bg-base-200/25 px-3 py-3 sm:col-span-2">
				<p class="mb-2 text-[0.65rem] font-semibold tracking-wide text-base-content/55 uppercase">
					History (30 days)
				</p>
				<div class="h-[7.5rem] w-full">
					<DirectorySeoDrHistoryChart series={LANDING_DIRECTORY_ANALYTICS_MOCK_SERIES} />
				</div>
			</div>
		</div>

		<div>
			<p class="mb-2 text-[0.65rem] font-semibold tracking-wide text-base-content/55 uppercase">
				Competitor domains
			</p>
			<ul class="space-y-2">
				{#each LANDING_DIRECTORY_ANALYTICS_MOCK_COMPETITORS as competitor, index (competitor.domain)}
					<li
						class="flex items-center justify-between gap-3 rounded-xl border border-base-300/90 bg-base-200/25 px-3 py-2.5"
					>
						<div class="flex min-w-0 items-center gap-2">
							<span
								class="size-2.5 shrink-0 rounded-full"
								style:background-color={directorySeoChartColorAt(index + 1)}
							></span>
							<div class="min-w-0">
								<p class="truncate text-sm font-medium">{competitor.label}</p>
								<p class="truncate text-xs text-base-content/55">{competitor.domain}</p>
							</div>
						</div>
						<div class="shrink-0 text-right">
							<p class="text-sm font-semibold tabular-nums">
								DR {formatDirectorySeoDr(competitor.domainRating)}
							</p>
							<p class="text-xs text-base-content/55">
								30d {formatDirectorySeoDelta(competitor.delta30Days)}
							</p>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
