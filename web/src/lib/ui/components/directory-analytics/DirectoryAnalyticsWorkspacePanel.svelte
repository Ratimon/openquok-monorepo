<script lang="ts">
	import type { AutoLaunchProductProfileDto } from '$lib/auto-launch/auto-launch.types';
	import type {
		DirectorySeoCompetitorDto,
		DirectorySeoHistoryPointDto,
		DirectorySeoWorkspaceOverviewDto
	} from '$lib/directory-seo';
	import {
		DIRECTORY_SEO_HISTORY_WINDOW_DAYS,
		type DirectorySeoHistoryWindowDays
	} from '$lib/directory-seo/directorySeoHistoryWindows';

	import { icons } from '$data/icons';

	import DirectorySeoCompetitorDrChart from '$lib/ui/components/directory-analytics/DirectorySeoCompetitorDrChart.svelte';
	import DirectorySeoDrHistoryChart from '$lib/ui/components/directory-analytics/DirectorySeoDrHistoryChart.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/ui/select';

	type Props = {
		loading: boolean;
		error: string | null;
		mainProfiles: AutoLaunchProductProfileDto[];
		selectedProfileId: string | null;
		overview: DirectorySeoWorkspaceOverviewDto | null;
		history: DirectorySeoHistoryPointDto[];
		historyWindowDays: DirectorySeoHistoryWindowDays;
		onHistoryWindowDaysChange: (days: DirectorySeoHistoryWindowDays) => void;
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
		/** When set, shown when the workspace has no main product profiles yet. */
		createProfileHref?: string;
		/** Opens product profile composer (e.g. add website URL on General tab). */
		editProfileWebsiteHref?: string | null;
	};

	let {
		loading,
		error,
		mainProfiles,
		selectedProfileId,
		overview,
		history,
		historyWindowDays,
		onHistoryWindowDaysChange,
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
		createProfileHref,
		editProfileWebsiteHref
	}: Props = $props();

	const hasMainProfiles = $derived(mainProfiles.length > 0);
	const selectedProfile = $derived(
		mainProfiles.find((profile) => profile.id === selectedProfileId) ?? null
	);
	const missingWebsiteUrl = $derived(
		Boolean(selectedProfileId && selectedProfile && !selectedProfile.websiteUrl?.trim())
	);
	const manualRefreshBlocked = $derived.by(() => {
		const nextAt = overview?.manualRefreshAvailableAt;
		if (!nextAt) return false;
		const ms = Date.parse(nextAt);
		return Number.isFinite(ms) && Date.now() < ms;
	});

	const manualRefreshTitle = $derived.by(() => {
		if (missingWebsiteUrl) {
			return 'Add a website URL to your product profile before refreshing domain rating';
		}
		const nextAt = overview?.manualRefreshAvailableAt;
		if (nextAt && manualRefreshBlocked) {
			return `You can refresh again after ${new Date(nextAt).toLocaleString()}`;
		}
		return undefined;
	});

	const canRefreshRatings = $derived(
		Boolean(
			selectedProfileId &&
				!missingWebsiteUrl &&
				!refreshing &&
				!manualRefreshBlocked &&
				(overview?.providerConfigured ?? true)
		)
	);

	const refreshButtonHint = $derived.by(() => {
		if (canRefreshRatings) return undefined;
		if (manualRefreshTitle) return manualRefreshTitle;
		if (refreshing) return 'Refresh in progress…';
		if (!selectedProfileId) return 'Select a product profile first';
		if (overview?.providerConfigured === false) {
			return 'Domain rating lookup is not configured on this server';
		}
		return undefined;
	});

	const productDomain = $derived(overview?.productDomain ?? null);
	const competitors = $derived(overview?.competitors ?? []);
	const canAddCompetitor = $derived(competitors.length < competitorCap);

	function formatDr(value: number | null | undefined): string {
		if (value == null || !Number.isFinite(value)) return '—';
		return String(Math.round(value));
	}

	function formatDelta(value: number | null | undefined): string {
		if (value == null || !Number.isFinite(value)) return '';
		const sign = value > 0 ? '+' : '';
		return `${sign}${value}`;
	}

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
			<Button
				type="button"
				variant="outline"
				disabled={!canRefreshRatings}
				onclick={onRefresh}
			>
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
				Add your product website on <span class="font-medium">{selectedProfile?.name ?? 'this profile'}</span> so OpenQuok
				can look up domain rating for Directory analytics.
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
				<p class="mt-1 text-2xl font-semibold">{formatDr(productDomain?.domainRating)}</p>
				{#if productDomain?.domain}
					<p class="mt-0.5 truncate text-xs text-base-content/55" title={productDomain.domain}>
						{productDomain.domain}
					</p>
				{/if}
				{#if productDomain}
					<p class="mt-1 text-xs text-base-content/60">
						7d {formatDelta(productDomain.delta7Days)}
						· 30d {formatDelta(productDomain.delta30Days)}
						· 90d {formatDelta(productDomain.delta90Days)}
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
				<DirectorySeoDrHistoryChart points={history} />
			</div>
		</div>

		<div class="space-y-3 rounded-xl border border-base-300 bg-base-100/60 p-4">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<h4 class="text-base font-semibold text-base-content">Competitors</h4>
				<p class="text-xs text-base-content/60">
					{competitors.length}/{competitorCap} on your plan
				</p>
			</div>

			<DirectorySeoCompetitorDrChart {productDomain} {competitors} />

			{#if competitors.length > 0}
				<ul class="space-y-2 border-t border-base-300/70 pt-3">
					{#each competitors as competitor (competitor.domain)}
						<li class="flex flex-wrap items-center justify-between gap-2 text-sm">
							<span class="font-medium">{competitor.label?.trim() || competitor.domain}</span>
							<div class="flex items-center gap-2">
								<span class="tabular-nums text-base-content/80">DR {formatDr(competitor.domainRating)}</span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									class="btn-xs h-7 min-h-0"
									onclick={() => onRemoveCompetitor(competitor.domain)}
								>
									Remove
								</Button>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-sm text-base-content/65">Add competitor domains to compare domain rating side by side.</p>
			{/if}

			{#if canAddCompetitor}
				<div class="flex flex-wrap items-end gap-2 border-t border-base-300/70 pt-3">
					<label class="flex min-w-[160px] flex-1 flex-col gap-1 text-xs">
						<span class="text-base-content/70">Domain</span>
						<input
							class="input input-bordered input-sm w-full"
							value={competitorDomain}
							oninput={(event) => onCompetitorDomainChange(event.currentTarget.value)}
							placeholder="competitor.com"
						/>
					</label>
					<label class="flex min-w-[140px] flex-1 flex-col gap-1 text-xs">
						<span class="text-base-content/70">Label (optional)</span>
						<input
							class="input input-bordered input-sm w-full"
							value={competitorLabel}
							oninput={(event) => onCompetitorLabelChange(event.currentTarget.value)}
							placeholder="Competitor"
						/>
					</label>
					<Button
						type="button"
						variant="primary"
						size="sm"
						disabled={addingCompetitor || !competitorDomain.trim()}
						onclick={onAddCompetitor}
					>
						Add competitor
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</section>
