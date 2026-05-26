<script lang="ts">
	import type {
		CreateSocialPostChannelViewModel,
		HomeChannelGroupViewModel,
		HomeChannelsLayoutModeViewModel,
		HomePlatformChannelRowViewModel
	} from '$lib/channels';
	import type { HomeChannelsGridFilterBuilderPresenter } from '$lib/channels/HomeChannelsGridFilterBuilder.presenter.svelte';
	import type { HomeChannelsGridTablePresenter } from '$lib/channels/HomeChannelsGridTable.presenter.svelte';

	import { browser } from '$app/environment';

	import { createHomeChannelsGridTableFilter } from '$lib/channels/HomeChannelsGridFilterBuilder.presenter.svelte';
	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import { Alert, AlertDescription, AlertTitle } from '$lib/ui/alert';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AddProvider from '$lib/ui/components/posts/AddProvider.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ChannelsChipsLayout from '$lib/ui/components/channels/ChannelsChipsLayout.svelte';
	import ChannelsGridLayout from '$lib/ui/components/channels/ChannelsGridLayout.svelte';

	type ListStatus = 'idle' | 'loading' | 'ready' | 'error';

	type Props = {
		workspaceId: string | null;
		listStatus: ListStatus;
		connectedChannelsVm: CreateSocialPostChannelViewModel[];
		accountSettingsWorkspaceHref: string;
		channelGroupSectionsVm: HomeChannelGroupViewModel[];
		platformChannelRowsUngroupedVm: HomePlatformChannelRowViewModel[];
		channelsGridPresenter: HomeChannelsGridTablePresenter;
		channelsFilterPresenter: HomeChannelsGridFilterBuilderPresenter;
		continueSetupHref: (integration: CreateSocialPostChannelViewModel) => string;
		onCreatePost: (preselectIntegrationId: string | null) => void;
		onCreatePostForGroup: (groupId: string) => void;
		onGoToCalendar: (groupId: string | null) => void;
		onMoveToGroup: (integration: CreateSocialPostChannelViewModel) => void;
		onEditTimeSlots: (integration: CreateSocialPostChannelViewModel) => void;
		onSetDisabled: (id: string, disabled: boolean) => Promise<boolean>;
		onRemove: (id: string) => Promise<boolean>;
		onAddAnotherChannel: (identifier: string) => void;
	};

	let {
		workspaceId,
		listStatus,
		connectedChannelsVm,
		accountSettingsWorkspaceHref,
		channelGroupSectionsVm,
		platformChannelRowsUngroupedVm,
		channelsGridPresenter,
		channelsFilterPresenter,
		continueSetupHref,
		onCreatePost,
		onCreatePostForGroup,
		onGoToCalendar,
		onMoveToGroup,
		onEditTimeSlots,
		onSetDisabled,
		onRemove,
		onAddAnotherChannel
	}: Props = $props();

	const DASHBOARD_CHANNELS_GRID_PAGE_SIZE = 25;

	const connectedChannelCount = $derived(connectedChannelsVm.length);

	const homeChannelTableRowsVm = $derived(channelsGridPresenter.homeChannelTableRowsVm);

	let channelsLayoutMode = $state<HomeChannelsLayoutModeViewModel>('chips');
	let channelsGridPage = $state(1);
	let channelsGridPageSize = $state(DASHBOARD_CHANNELS_GRID_PAGE_SIZE);
	let channelsGridHostEl = $state<HTMLDivElement | null>(null);
	let channelsGridHostWidthPx = $state(0);
	let windowWidthPx = $state(0);
	let groupDetailsOpen = $state<Record<string, boolean>>({});
	let ungroupedDetailsOpen = $state(true);

	const channelsGridFilteredRowsVm = $derived.by(() => {
		const filter = createHomeChannelsGridTableFilter(channelsFilterPresenter.value);
		return homeChannelTableRowsVm.filter(filter);
	});

	const channelsGridPagedRowsVm = $derived.by(() => {
		const from = (channelsGridPage - 1) * channelsGridPageSize;
		const to = Math.min(from + channelsGridPageSize, channelsGridFilteredRowsVm.length);
		return channelsGridFilteredRowsVm.slice(from, to);
	});

	function readViewportWidthPx(): number {
		if (!browser || typeof window === 'undefined') return 0;
		const inner = window.innerWidth;
		const vv = window.visualViewport?.width;
		return Math.floor(Math.min(inner, vv != null && vv > 0 ? vv : inner));
	}

	const layoutTierWidthPx = $derived.by(() => {
		if (!browser) return 0;
		return windowWidthPx > 0 ? windowWidthPx : readViewportWidthPx();
	});

	const channelsGridLayoutWidthPx = $derived.by(() => {
		if (!browser) return 0;
		const vw = layoutTierWidthPx;
		if (vw <= 0) return 0;
		if (vw <= 640) return vw;
		const host = channelsGridHostWidthPx;
		if (host > 0) return Math.min(vw, Math.floor(host));
		return vw;
	});

	const channelsGridColumnsForHost = $derived.by(() =>
		channelsGridPresenter.getHomeChannelsGridColumnsForViewport(
			layoutTierWidthPx,
			channelsGridLayoutWidthPx,
			browser
		)
	);

	const channelsGridSizesForHost = $derived.by(() =>
		channelsGridPresenter.getHomeChannelsGridSizesForViewport(layoutTierWidthPx, browser)
	);

	const channelsGridAutoRowHeight = $derived(
		channelsGridPresenter.getHomeChannelsGridAutoRowHeight(layoutTierWidthPx, browser)
	);

	const hasSocialPlatformWithMultipleChannels = $derived.by(() => {
		const social = connectedChannelsVm.filter((c) => (c.type ?? '').toLowerCase() === 'social');
		const counts = new Map<string, number>();
		for (const c of social) {
			const key = c.identifier?.trim() || 'unknown';
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
		for (const n of counts.values()) {
			if (n >= 2) return true;
		}
		return false;
	});

	const showSamePlatformMultiChannelAlert = $derived(
		Boolean(workspaceId) &&
			listStatus === 'ready' &&
			connectedChannelCount === 1 &&
			!hasSocialPlatformWithMultipleChannels
	);

	function handleCreatePostForAllChannels() {
		if (!workspaceId) {
			toast.error('Create or select a workspace first.');
			return;
		}
		onCreatePost(null);
	}

	$effect.pre(() => {
		for (const g of channelGroupSectionsVm) {
			if (groupDetailsOpen[g.id] === undefined) {
				groupDetailsOpen[g.id] = true;
			}
		}
	});

	$effect.pre(() => {
		if (!browser) return;
		windowWidthPx = readViewportWidthPx();
	});

	$effect(() => {
		if (!browser) return;
		const update = () => {
			windowWidthPx = readViewportWidthPx();
		};
		window.addEventListener('resize', update);
		window.visualViewport?.addEventListener('resize', update);
		return () => {
			window.removeEventListener('resize', update);
			window.visualViewport?.removeEventListener('resize', update);
		};
	});

	$effect(() => {
		if (!browser) return;
		const el = channelsGridHostEl;
		if (!el) {
			channelsGridHostWidthPx = 0;
			return;
		}
		let raf = 0;
		const commit = () => {
			raf = 0;
			const next = Math.round(el.getBoundingClientRect().width);
			if (channelsGridHostWidthPx === 0 || Math.abs(next - channelsGridHostWidthPx) >= 6) {
				channelsGridHostWidthPx = next;
			}
		};
		const schedule = () => {
			if (raf) cancelAnimationFrame(raf);
			raf = requestAnimationFrame(commit);
		};
		schedule();
		const ro = new ResizeObserver(schedule);
		ro.observe(el);
		return () => {
			ro.disconnect();
			if (raf) cancelAnimationFrame(raf);
		};
	});

	$effect(() => {
		void workspaceId;
		channelsFilterPresenter.reset();
	});

	$effect(() => {
		void homeChannelTableRowsVm;
		void channelsFilterPresenter.value;
		void channelsGridPageSize;
		channelsGridPage = 1;
	});

	$effect(() => {
		const total = channelsGridFilteredRowsVm.length;
		const pageCount = Math.max(1, Math.ceil(total / channelsGridPageSize) || 1);
		if (channelsGridPage > pageCount) {
			channelsGridPage = pageCount;
		}
	});
</script>

<section class="mt-8" aria-labelledby="connected-channels-heading">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex min-w-0 flex-wrap items-center gap-3">
			<h2 id="connected-channels-heading" class="text-xl font-bold text-base-content">
				Connected channels
			</h2>
			{#if listStatus === 'ready' && connectedChannelCount > 0}
				<div
					class="inline-flex overflow-hidden rounded-lg border border-base-300 bg-base-100"
					role="group"
					aria-label="Chips or table layout"
				>
					<Button
						type="button"
						variant={channelsLayoutMode === 'chips' ? 'secondary' : 'ghost'}
						size="sm"
						class="rounded-none px-2.5"
						aria-label="Grouped chips view"
						aria-pressed={channelsLayoutMode === 'chips'}
						onclick={() => (channelsLayoutMode = 'chips')}
					>
						<AbstractIcon name={icons.List.name} class="size-4" width="16" height="16" />
					</Button>
					<Button
						type="button"
						variant={channelsLayoutMode === 'table' ? 'secondary' : 'ghost'}
						size="sm"
						class="rounded-none px-2.5"
						aria-label="Table view"
						aria-pressed={channelsLayoutMode === 'table'}
						onclick={() => (channelsLayoutMode = 'table')}
					>
						<AbstractIcon name={icons.Table.name} class="size-4" width="16" height="16" />
					</Button>
				</div>
			{/if}
		</div>

		<div class="flex flex-wrap items-center justify-end gap-2">
			{#if connectedChannelCount >= 1}
				<Button
					type="button"
					variant="primary"
					class="gap-1.5"
					disabled={!workspaceId}
					onclick={handleCreatePostForAllChannels}
				>
					<AbstractIcon name={icons.Plus.name} class="h-4 w-4" width="16" height="16" />
					Create Post for All Channels
				</Button>
				<Button
					type="button"
					variant="outline"
					class="gap-1.5"
					disabled={!workspaceId}
					onclick={() => onGoToCalendar(null)}
				>
					<AbstractIcon
						name={icons.CalendarClock.name}
						class="h-4 w-4"
						width="16"
						height="16"
					/>
					Calendar
				</Button>
			{/if}
			<AddProvider buttonLabel="Add Channel" hasConnectedChannels={connectedChannelCount >= 1} />
			<AddProvider
				invite
				iconOnly
				iconOnlyTooltip="Send Invite Link to connect channel"
				hasConnectedChannels={connectedChannelCount >= 1}
			/>
		</div>
	</div>

	{#if showSamePlatformMultiChannelAlert}
		<Alert
			variant="warning"
			class="mt-3 items-start gap-3 text-sm text-neutral-950 sm:flex-row [&_svg]:text-neutral-950"
		>
			<AbstractIcon
				name={icons.CircleAlert.name}
				class="mt-0.5 h-5 w-5 shrink-0 text-neutral-950"
				width="20"
				height="20"
				focusable="false"
			/>
			<div class="min-w-0 space-y-1">
				<AlertTitle class="text-sm font-semibold leading-snug text-neutral-950">
					Multiple channels on the same platform
				</AlertTitle>
				<AlertDescription class="leading-relaxed text-neutral-900">
					You can connect more than one channel per platform. Before you use
					<span class="font-semibold text-neutral-950">Add Channel</span> or
					<span class="font-semibold text-neutral-950">Add more</span> for a different login,
					sign out of that service in your browser. Otherwise the channel may be reused for the last connected channel.
				</AlertDescription>
			</div>
		</Alert>
	{/if}

	{#if !workspaceId}
		<p class="mt-3 text-sm text-base-content/70">
			Select or create a workspace in
			<a class="link link-primary" href={accountSettingsWorkspaceHref}>settings</a>
			to load channels.
		</p>
	{:else if listStatus === 'loading'}
		<p class="mt-4 flex items-center gap-2 text-sm text-base-content/70">
			<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
			Loading channels…
		</p>
	{:else if listStatus === 'error'}
		<p class="mt-3 text-sm text-error">
			Could not load channels. Try again in a moment.
		</p>
	{:else if connectedChannelCount === 0}
		<div class="mt-4 space-y-3">
			<h3 class="text-base font-semibold text-base-content">
				No channels yet
			</h3>
			<p class="text-sm text-base-content/70">
				Connect your social accounts to start scheduling, publishing, and analyzing — all in one place.
			</p>
			<p class="text-sm text-base-content/70">
				Use <span class="font-medium text-base-content">Add Channel</span> above to connect one.
			</p>
		</div>
	{:else if channelsLayoutMode === 'table'}
		<ChannelsGridLayout
			filteredRowCount={channelsGridFilteredRowsVm.length}
			pagedRowsVm={channelsGridPagedRowsVm}
			filterValue={channelsFilterPresenter.value}
			filterFields={channelsFilterPresenter.fields}
			filterHasAnyRule={channelsFilterPresenter.hasAnyRule}
			filterIsReady={channelsFilterPresenter.isReady}
			filterAddMenuOpen={channelsFilterPresenter.addFilterMenuOpen}
			filterAddableFieldOptions={channelsFilterPresenter.addableFieldOptions}
			filterOptions={channelsFilterPresenter.buildOptions(homeChannelTableRowsVm)}
			gridColumns={channelsGridColumnsForHost}
			gridSizes={channelsGridSizesForHost}
			gridAutoRowHeight={channelsGridAutoRowHeight}
			gridCellStyle={channelsGridPresenter.homeChannelsGridCellStyle}
			bind:gridHostEl={channelsGridHostEl}
			bind:gridPage={channelsGridPage}
			bind:gridPageSize={channelsGridPageSize}
			onFilterInit={(api) => channelsFilterPresenter.initFilterBuilderApi(api)}
			onFilterChange={(ev) => channelsFilterPresenter.applyChange(ev)}
			onFilterToggleAddMenu={() => channelsFilterPresenter.toggleAddFilterMenu()}
			onFilterAddField={(fieldId) => channelsFilterPresenter.addFilterForField(fieldId)}
			onGridInit={() => {}}
		/>
	{:else if workspaceId}
		<ChannelsChipsLayout
			{channelGroupSectionsVm}
			{platformChannelRowsUngroupedVm}
			bind:groupDetailsOpen
			bind:ungroupedDetailsOpen
			{workspaceId}
			{continueSetupHref}
			{onCreatePostForGroup}
			onCreatePost={onCreatePost}
			onGoToCalendar={onGoToCalendar}
			onCreatePostForChannel={(id) => onCreatePost(id)}
			{onMoveToGroup}
			{onEditTimeSlots}
			{onSetDisabled}
			{onRemove}
			{onAddAnotherChannel}
		/>
	{/if}
</section>
