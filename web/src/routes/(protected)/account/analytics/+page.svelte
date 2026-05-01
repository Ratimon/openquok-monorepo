<script lang="ts">
	import { goto } from '$app/navigation';
	import { absoluteUrl, route, url } from '$lib/utils/path';

	import { getRootPathAccount, protectedDashboardPagePresenter } from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';
	import SocialChannelFilter, {
		type SocialPlatformFilterVm
	} from '$lib/ui/components/calendar-scheduler/SocialChannelFilter.svelte';
	import RenderAnalyticsGrid from '$lib/ui/platform-analytics/RenderAnalyticsGrid.svelte';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/ui/select';
	import { socialProviderIcon } from '$lib/posts/constants/socialProviderIcons';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS } from '$lib/platform-analytics';

	const accountRoot = route(getRootPathAccount());
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const connectedChannelsVm = $derived(protectedDashboardPagePresenter.connectedChannelsVm);
	const listStatus = $derived(protectedDashboardPagePresenter.listStatus);
	const channelsLoadPending = $derived(listStatus === 'idle' || listStatus === 'loading');

	const supportedIntegrations = [...SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS];
	const supportedIntegrationSet = new Set<string>(supportedIntegrations);

	let dateWindowDays = $state<number>(7);
	let platformFilter = $state<SocialPlatformFilterVm>({
		allSocialPlatforms: true,
		selectedSocialPlatformIdentifiers: []
	});

	const filteredIntegrations = $derived.by(() => {
		const list = connectedChannelsVm.filter((c) =>
			supportedIntegrationSet.has(String(c.identifier ?? '').trim())
		);
		if (platformFilter.allSocialPlatforms) return list;
		const allowed = new Set(platformFilter.selectedSocialPlatformIdentifiers);
		return list.filter((c) => allowed.has(String(c.identifier ?? '')));
	});

	function goToCalendarToAddChannels() {
		void goto(`${accountRoot}/calendar`);
	}

	function supportedLabel(identifier: string): string {
		return identifier
			.split('-')
			.filter(Boolean)
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join('-');
	}

	function continueSetupHrefForIntegration(integration: CreateSocialPostChannelViewModel): string {
		if (!workspaceId) return url(`/${getRootPathAccount()}`);
		if (integration.identifier === 'instagram-business') {
			const qs = new URLSearchParams({
				organizationId: workspaceId,
				integrationId: integration.id,
				returnTo: url('/account/analytics')
			});
			return absoluteUrl(`${integrationOAuthCallbackPath('instagram-business')}?${qs}`);
		}
		const qs = new URLSearchParams({
			organizationId: workspaceId,
			returnTo: url('/account/analytics'),
			refresh: integration.internalId
		});
		return absoluteUrl(`${integrationOAuthCallbackPath(integration.identifier)}?${qs}`);
	}

	async function noopAsync(): Promise<boolean> {
		return false;
	}

	$effect(() => {
		const orgId = workspaceId;
		if (!orgId) return;
		void protectedDashboardPagePresenter.loadDashboardLists();
	});
</script>

<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="space-y-1">
			<h2 class="text-2xl font-bold text-base-content">Analytics</h2>
			<p class="text-base-content/70 text-sm">Track performance across your connected channels.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button type="button" variant="outline" href={route(getRootPathAccount())}>
				<AbstractIcon name={icons.ArrowLeft.name} class="size-4" width="16" height="16" />
				Back to dashboard
			</Button>
		</div>
	</div>

	{#if !workspaceId}
		<p class="text-sm text-base-content/70">Select or create a workspace to load analytics.</p>
	{:else if channelsLoadPending}
		<p class="flex items-center gap-2 text-sm text-base-content/70">
			<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
			Loading channels…
		</p>
	{:else if listStatus === 'error'}
		<p class="text-sm text-error">Could not load channels. Try again in a moment.</p>
	{:else if connectedChannelsVm.length === 0}
		<div class="space-y-4 text-center py-10">
			<div class="mx-auto max-w-xl space-y-3">
				<p class="text-3xl font-semibold text-base-content">Can’t show analytics yet</p>
				<p class="text-base-content/70 text-sm">You have to add Social Media channels.</p>
				<p class="text-base-content/70 text-sm">
					Supported: {supportedIntegrations.map(supportedLabel).join(', ')}
				</p>
			</div>
			<div class="flex justify-center">
				<Button type="button" variant="primary" onclick={goToCalendarToAddChannels}>
					Go to the calendar to add channels
				</Button>
			</div>
		</div>
	{:else}
		<section class="space-y-3">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h3 class="text-lg font-semibold text-base-content">Targeted channels</h3>
				<div class="flex flex-wrap items-center justify-end gap-2">
					<SocialChannelFilter
						channels={connectedChannelsVm}
						allSocialPlatforms={platformFilter.allSocialPlatforms}
						selectedSocialPlatformIdentifiers={platformFilter.selectedSocialPlatformIdentifiers}
						onChange={(next) => (platformFilter = next)}
					/>

					<div class="w-[200px]">
						<Select type="single" value={String(dateWindowDays)} onValueChange={(v) => (dateWindowDays = Number(v))}>
							<SelectTrigger class="border-base-300 bg-base-100/60">
								<span class="text-sm">{dateWindowDays} Days</span>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="7">7 Days</SelectItem>
								<SelectItem value="30">30 Days</SelectItem>
								<SelectItem value="90">90 Days</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{#if filteredIntegrations.length === 0}
				<p class="text-sm text-base-content/70">No channels match the current filter.</p>
			{:else}
				<ul class="flex list-none flex-row flex-wrap items-center gap-2 p-0">
					{#each filteredIntegrations as integration (integration.id)}
						<li class="min-w-0">
							<IntegrationMenu
								variant="chip"
								showProviderBadge={true}
								{integration}
								workspaceId={workspaceId}
								providerIcon={socialProviderIcon}
								continueSetupHref={continueSetupHrefForIntegration}
								onMoveToGroup={() => {}}
								onEditTimeSlots={() => {}}
								onSetDisabled={noopAsync}
								onRemove={noopAsync}
							/>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="space-y-3">
			<h3 class="text-lg font-semibold text-base-content">Overview</h3>
			<RenderAnalyticsGrid organizationId={workspaceId} integrations={filteredIntegrations} dateWindowDays={dateWindowDays} />
		</section>
	{/if}
</div>

