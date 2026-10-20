<script lang="ts">
	import type { AutoLaunchProductProfileDto } from '$lib/auto-launch/auto-launch.types';
	import type { DirectorySeoHistoryChartSeriesViewModel } from '$lib/directory-seo/buildDirectorySeoHistoryChartSeries';
	import type { DirectorySeoWorkspaceOverviewDto } from '$lib/directory-seo';
	import {
		DIRECTORY_SEO_HISTORY_WINDOW_DAYS,
		type DirectorySeoHistoryWindowDays
	} from '$lib/directory-seo/directorySeoHistoryWindows';
	import {
		formatDirectorySeoDelta,
		formatDirectorySeoDr
	} from '$lib/directory-seo/formatDirectorySeoDisplay';
	import type { DirectorySeoHistoryCompareOptionViewModel } from '$lib/directory-seo/GetDirectorySeo.presenter.svelte';

	import { icons } from '$data/icons';

	import DirectorySeoCompetitorDrChart from '$lib/ui/components/directory-analytics/DirectorySeoCompetitorDrChart.svelte';
	import DirectorySeoCompetitorListItem from '$lib/ui/components/directory-analytics/DirectorySeoCompetitorListItem.svelte';
	import DirectorySeoDrHistoryChart from '$lib/ui/components/directory-analytics/DirectorySeoDrHistoryChart.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import HomeAccountNoticeBanner from '$lib/ui/components/home/HomeAccountNoticeBanner.svelte';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/ui/select';

	type Props = {
		loading: boolean;
		error: string | null;
		mainProfiles: AutoLaunchProductProfileDto[];
		selectedProfileId: string | null;
		selectedProfileName: string | null;
		missingWebsiteUrl: boolean;
		overview: DirectorySeoWorkspaceOverviewDto | null;
		historyChartSeries: DirectorySeoHistoryChartSeriesViewModel[];
		historyCompareOptions: DirectorySeoHistoryCompareOptionViewModel[];
		historyWindowDays: DirectorySeoHistoryWindowDays;
		canRefreshRatings: boolean;
		refreshButtonHint: string | undefined;
		manualRefreshBlocked: boolean;
		onHistoryWindowDaysChange: (days: DirectorySeoHistoryWindowDays) => void;
		onToggleHistoryCompareCompetitor: (domain: string) => void;
		competitorCap: number;
		refreshing: boolean;
		competitorDomain: string;
		competitorLabel: string;
		addingCompetitor: boolean;
		onSelectProfile: (profileId: string) => void;
		onRefresh: () => void;
		onCompetitorDomainChange: (value: string) => void;
		onCompetitorLabelChange: (value: string) => void;
		onAddCompetitor: () => void;
		onRemoveCompetitor: (domain: string) => void;
		competitorLabelSavingDomain?: string | null;
		onUpdateCompetitorLabel: (domain: string, label: string | null) => void | Promise<void>;
		billingHref?: string;
		createProfileHref?: string;
		editProfileWebsiteHref?: string | null;
	};

	let {
		loading,
		error,
		mainProfiles,
		selectedProfileId,
		selectedProfileName,
		missingWebsiteUrl,
		overview,
		historyChartSeries,
		historyCompareOptions,
		historyWindowDays,
		canRefreshRatings,
		refreshButtonHint,
		manualRefreshBlocked,
		onHistoryWindowDaysChange,
		onToggleHistoryCompareCompetitor,
		competitorCap,
		refreshing,
		competitorDomain,
		competitorLabel,
		addingCompetitor,
		onSelectProfile,
		onRefresh,
		onCompetitorDomainChange,
		onCompetitorLabelChange,
		onAddCompetitor,
		onRemoveCompetitor,
		competitorLabelSavingDomain = null,
		onUpdateCompetitorLabel,
		billingHref,
		createProfileHref,
		editProfileWebsiteHref
	}: Props = $props();

	const hasMainProfiles = $derived(mainProfiles.length > 0);
	const productDomain = $derived(overview?.productDomain ?? null);
	const competitors = $derived(overview?.competitors ?? []);
	const competitorLimit = $derived(competitorCap >= 1 ? competitorCap : null);
	const competitorCountLabel = $derived(
		competitorLimit != null ? `${competitors.length}/${competitorLimit}` : null
	);
	const isCompetitorLimitFull = $derived(
		competitorLimit != null && competitors.length >= competitorLimit
	);
	const showCompetitorUpgradeCta = $derived(isCompetitorLimitFull && Boolean(billingHref));
	const canAddCompetitor = $derived(!isCompetitorLimitFull);
	const showCompetitorPlanNotice = $derived(
		competitors.length > 0 && competitorLimit != null
	);
</script>

<section class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div class="min-w-[220px] space-y-1">
			<p class="text-sm font-medium text-base-content">Product profile</p>
			<Select
				type="single"
				value={selectedProfileId ?? ''}
				onValueChange={(value) => onSelectProfile(value)}
				disabled={!hasMainProfiles}
			>
				<SelectTrigger class="border-base-300 bg-base-100/60">
					<span class="truncate text-sm">
						{mainProfiles.find((profile) => profile.id === selectedProfileId)?.name ??
							(hasMainProfiles ? 'Select a profile' : 'No profiles yet')}
					</span>
				</SelectTrigger>
				<SelectContent>
					{#each mainProfiles as profile (profile.id)}
						<SelectItem value={profile.id}>{profile.name}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</div>
		<span class="inline-flex" title={refreshButtonHint}>
			<Button type="button" variant="outline" disabled={!canRefreshRatings} onclick={onRefresh}>
				{#if refreshing}
					<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
				{/if}
				Refresh ratings
			</Button>
		</span>
	</div>

	{#if loading}
		<p class="flex items-center gap-2 text-sm text-base-content/70">
			<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
			Loading directory analytics…
		</p>
	{:else if error}
		<p class="text-sm text-error">{error}</p>
	{:else if !hasMainProfiles}
		<div class="space-y-4 rounded-xl border border-dashed border-base-300 bg-base-100/40 px-6 py-10 text-center">
			<p class="text-base font-medium text-base-content">No business profile yet</p>
			<p class="mx-auto max-w-md text-sm text-base-content/70">
				Create a main product profile with your website URL to track domain rating trends and competitors
				here.
			</p>
			{#if createProfileHref}
				<Button type="button" variant="primary" href={createProfileHref}>
					Create business profile
				</Button>
			{/if}
		</div>
	{:else if !selectedProfileId}
		<p class="text-sm text-base-content/70">Select a main product profile to view domain rating trends.</p>
	{:else if missingWebsiteUrl}
		<div
			class="space-y-4 rounded-xl border border-dashed border-warning/40 bg-warning/5 px-6 py-8 text-center"
		>
			<p class="text-base font-medium text-base-content">Website URL required</p>
			<p class="mx-auto max-w-md text-sm text-base-content/70">
				Add your product website on <span class="font-medium">{selectedProfileName ?? 'this profile'}</span>
				so OpenQuok can look up domain rating for Directory analytics.
			</p>
			{#if editProfileWebsiteHref}
				<Button type="button" variant="primary" href={editProfileWebsiteHref}>
					Add website URL
				</Button>
			{/if}
		</div>
	{:else}
		{#if overview?.providerConfigured === false}
			<p class="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-base-content/80">
				Live domain rating lookup is not configured on this server (missing DataForSEO credentials). Ask
				your admin to set <code class="text-xs">DATAFORSEO_API_KEY</code> on the API.
			</p>
		{:else if productDomain && productDomain.domainRating == null && productDomain.checkedAt}
			<p class="text-sm text-base-content/65">
				No domain rating was returned for <span class="font-medium">{productDomain.domain}</span>. The
				domain may be too new for DataForSEO, or the lookup failed.
			</p>
		{/if}
		<div class="grid gap-4 sm:grid-cols-3">
			<div class="rounded-lg border border-base-300 bg-base-100/60 px-4 py-3">
				<p class="text-xs font-medium uppercase tracking-wide text-base-content/55">Your domain DR</p>
				<p class="mt-1 text-2xl font-semibold">{formatDirectorySeoDr(productDomain?.domainRating)}</p>
				{#if productDomain?.domain}
					<p class="mt-0.5 truncate text-xs text-base-content/55" title={productDomain.domain}>
						{productDomain.domain}
					</p>
				{/if}
				{#if productDomain}
					<p class="mt-1 text-xs text-base-content/60">
						7d {formatDirectorySeoDelta(productDomain.delta7Days)}
						· 30d {formatDirectorySeoDelta(productDomain.delta30Days)}
						· 90d {formatDirectorySeoDelta(productDomain.delta90Days)}
					</p>
				{/if}
				{#if manualRefreshBlocked && overview?.manualRefreshAvailableAt}
					<p class="mt-2 text-xs text-base-content/55">
						Manual refresh available {new Date(overview.manualRefreshAvailableAt).toLocaleString()}.
					</p>
				{/if}
			</div>
			<div class="rounded-lg border border-base-300 bg-base-100/60 px-4 py-3 sm:col-span-2">
				<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
					<p class="text-xs font-medium uppercase tracking-wide text-base-content/55">
						History ({historyWindowDays} days)
					</p>
					<div
						class="inline-flex rounded-md border border-base-300 p-0.5"
						role="group"
						aria-label="History chart range"
					>
						{#each DIRECTORY_SEO_HISTORY_WINDOW_DAYS as windowDays (windowDays)}
							<Button
								type="button"
								variant={historyWindowDays === windowDays ? 'primary' : 'ghost'}
								size="sm"
								class="rounded px-2.5 py-1 text-xs"
								onclick={() => onHistoryWindowDaysChange(windowDays)}
							>
								{windowDays}d
							</Button>
						{/each}
					</div>
				</div>
				{#if historyCompareOptions.length > 0}
					<div
						class="mb-2 flex flex-wrap items-center gap-1.5"
						role="group"
						aria-label="Compare competitors on history chart"
					>
						<span class="text-xs text-base-content/55">Compare:</span>
						{#each historyCompareOptions as option (option.domain)}
							<Button
								type="button"
								variant={option.selected ? 'primary' : 'outline'}
								size="sm"
								class="h-7 min-h-0 rounded-full px-2.5 text-xs"
								onclick={() => onToggleHistoryCompareCompetitor(option.domain)}
							>
								{option.label}
							</Button>
						{/each}
					</div>
				{/if}
				<DirectorySeoDrHistoryChart series={historyChartSeries} />
			</div>
		</div>

		<div class="space-y-3 rounded-xl border border-base-300 bg-base-100/60 p-4">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<h4 class="text-base font-semibold text-base-content">
					Competitors
					{#if competitorCountLabel}
						<span class={isCompetitorLimitFull ? 'text-warning' : 'text-base-content/70'}>
							({competitorCountLabel})
						</span>
					{/if}
				</h4>
				{#if showCompetitorUpgradeCta && billingHref}
					<Button href={billingHref} variant="outline" size="sm" class="gap-1.5">
						<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
						Upgrade plan
					</Button>
				{/if}
			</div>

			{#if showCompetitorPlanNotice}
				<HomeAccountNoticeBanner
					iconName={isCompetitorLimitFull ? icons.Sparkles.name : icons.Info.name}
					tone={isCompetitorLimitFull ? 'upgrade' : 'neutral'}
					dismissible={!isCompetitorLimitFull}
				>
					<p class="text-base-content/90">
						{#if isCompetitorLimitFull}
							You have reached your plan competitor limit
							<span class="font-medium tabular-nums">({competitorCountLabel})</span>. Upgrade to
							track more domains on Directory analytics.
						{:else}
							Competitors on your plan:
							<span class="font-medium tabular-nums">{competitorCountLabel}</span>
							used for this profile. Upgrade for a higher cap.
						{/if}
					</p>
					{#snippet actions()}
						{#if showCompetitorUpgradeCta && billingHref}
							<Button href={billingHref} variant="secondary" size="sm" class="gap-1.5">
								<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
								Upgrade plan
							</Button>
						{/if}
					{/snippet}
				</HomeAccountNoticeBanner>
			{/if}

			<DirectorySeoCompetitorDrChart {productDomain} {competitors} />

			{#if competitors.length === 0 && canAddCompetitor}
				<p class="text-sm text-base-content/65">
					Add competitor domains to compare domain rating side by side.
				</p>
			{/if}

			{#if competitors.length > 0 || canAddCompetitor}
				<ul class="grid list-none gap-3 border-t border-base-300/70 pt-3 sm:grid-cols-2">
					{#each competitors as competitor, index (competitor.domain)}
						<DirectorySeoCompetitorListItem
							{competitor}
							colorIndex={index + 1}
							saving={competitorLabelSavingDomain === competitor.domain}
							onSaveLabel={(label) => onUpdateCompetitorLabel(competitor.domain, label)}
							onRemove={() => onRemoveCompetitor(competitor.domain)}
						/>
					{/each}
					{#if canAddCompetitor}
						<li
							class="flex h-full flex-col gap-3 rounded-lg border border-dashed border-base-300/80 bg-base-200/50 p-4 shadow-sm"
							aria-labelledby="add-competitor-heading"
						>
							<div class="space-y-0.5">
								<p id="add-competitor-heading" class="text-base font-semibold text-base-content">
									Add competitor
								</p>
								<p class="text-xs text-base-content/55">Track another domain on charts and DR compare.</p>
							</div>
							<div class="flex flex-1 flex-col gap-3">
								<label class="flex flex-col gap-1.5 text-xs">
									<span class="font-medium text-base-content/70">Domain</span>
									<input
										class="input input-bordered input-sm w-full"
										value={competitorDomain}
										oninput={(event) => onCompetitorDomainChange(event.currentTarget.value)}
										placeholder="competitor.com"
									/>
								</label>
								<label class="flex flex-col gap-1.5 text-xs">
									<span class="font-medium text-base-content/70">Display name (optional)</span>
									<input
										class="input input-bordered input-sm w-full"
										value={competitorLabel}
										oninput={(event) => onCompetitorLabelChange(event.currentTarget.value)}
										placeholder="Competitor"
									/>
								</label>
							</div>
							<div class="border-t border-base-300/60 pt-3">
								<Button
									type="button"
									variant="primary"
									size="sm"
									class="min-h-8 w-full"
									disabled={addingCompetitor || !competitorDomain.trim()}
									onclick={onAddCompetitor}
								>
									Add competitor
								</Button>
							</div>
						</li>
					{/if}
				</ul>
			{/if}

			{#if isCompetitorLimitFull && billingHref}
				<div
					class="flex flex-wrap items-center justify-between gap-3 border-t border-base-300/70 pt-3 text-sm text-base-content/80"
				>
					<p>Remove a competitor or upgrade your plan to add another domain.</p>
					<Button href={billingHref} variant="warning" size="sm" class="gap-1.5">
						<AbstractIcon name={icons.Lock.name} class="size-4" width="16" height="16" />
						Competitor limit reached
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</section>
