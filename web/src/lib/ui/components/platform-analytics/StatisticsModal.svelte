<script lang="ts">
	import type { ProtectedCalendarPagePresenter } from '$lib/area-protected/ProtectedCalendarPage.presenter.svelte';
	import type { AnalyticsSeriesViewModel } from '$lib/platform-analytics/GetAnalytics.presenter.svelte';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AnalyticsCard from '$lib/ui/components/platform-analytics/AnalyticsCard.svelte';
	import MissingReleaseModal from '$lib/ui/components/platform-analytics/MissingReleaseModal.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/ui/select';

	type Props = {
		open: boolean;
		postId: string | null;
		organizationId: string | null;
		loadPostAnalytics: ProtectedCalendarPagePresenter['loadPostStatisticsAnalyticsVm'];
		loadMissingCandidates: ProtectedCalendarPagePresenter['loadMissingPublishCandidatesForPost'];
		updatePostRelease: ProtectedCalendarPagePresenter['updatePostReleaseIdForStatistics'];
		onClose?: () => void;
	};

	let {
		open = $bindable(false),
		postId,
		organizationId,
		loadPostAnalytics,
		loadMissingCandidates,
		updatePostRelease,
		onClose
	}: Props = $props();

	let dateWindowDays = $state(7);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let showMissing = $state(false);
	let seriesVm = $state<AnalyticsSeriesViewModel[]>([]);
	let totals = $state<string[]>([]);

	async function loadAnalytics(): Promise<void> {
		if (!postId || !organizationId) return;
		loading = true;
		error = null;
		showMissing = false;
		const postStatisticsVm = await loadPostAnalytics({
			organizationId,
			postId,
			date: dateWindowDays
		});
		loading = false;
		error = postStatisticsVm.error ?? null;
		showMissing = postStatisticsVm.missing === true;
		seriesVm = postStatisticsVm.seriesVm;
		totals = postStatisticsVm.totalsVm;
	}

	$effect(() => {
		if (!open || !postId || !organizationId) return;
		void postId;
		void organizationId;
		void dateWindowDays;
		void loadAnalytics();
	});

	function handleDialogOpenChange(next: boolean): void {
		open = next;
		if (!next) onClose?.();
	}

	function afterConnectSuccess(): void {
		showMissing = false;
		void loadAnalytics();
	}
</script>

<Dialog.Root bind:open onOpenChange={handleDialogOpenChange}>
	<Dialog.Content class="max-h-[85vh] max-w-4xl overflow-y-auto p-0 sm:max-w-4xl" showCloseButton={true}>
		<div class="border-b border-base-300 px-6 py-4">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div class="min-w-0">
					<Dialog.DialogTitle class="text-lg font-semibold text-base-content">Statistics</Dialog.DialogTitle>
					<p class="mt-1 text-sm text-base-content/70">
						Post performance from the connected platform.
					</p>
				</div>
				{#if postId && organizationId && !showMissing}
					<div class="w-[160px] shrink-0">
						<Select
							type="single"
							value={String(dateWindowDays)}
							onValueChange={(v) => (dateWindowDays = Number(v))}
						>
							<SelectTrigger class="border-base-300 bg-base-100/60" disabled={loading}>
								<span class="text-sm">{dateWindowDays} days</span>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="7">7 days</SelectItem>
								<SelectItem value="30">30 days</SelectItem>
								<SelectItem value="90">90 days</SelectItem>
							</SelectContent>
						</Select>
					</div>
				{/if}
			</div>
		</div>

		<div class="px-6 py-4">
			{#if !postId || !organizationId}
				<p class="text-sm text-base-content/70">
                    Nothing to show.
                </p>
			{:else if loading}
				<div class="flex items-center justify-center py-12 text-sm text-base-content/70">
					<AbstractIcon name={icons.LoaderCircle.name} class="h-6 w-6 animate-spin" width="24" height="24" />
					<span class="ms-2">Loading analytics…</span>
				</div>
			{:else if showMissing}
				<MissingReleaseModal
					{postId}
					organizationId={organizationId}
					{loadMissingCandidates}
					{updatePostRelease}
					onSuccess={afterConnectSuccess}
					onCancel={() => (open = false)}
				/>
			{:else if error}
				<div class="rounded-lg border border-error/30 bg-error/5 p-4 text-sm text-error">{error}</div>
			{:else if seriesVm.length === 0}
				<div class="py-10 text-center text-sm text-base-content/70">
					No statistics available for this post.
				</div>
			{:else}
				<h3 class="mb-4 text-base font-semibold text-base-content">Post analytics</h3>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each seriesVm as item, index (item.label)}
						<AnalyticsCard seriesVm={item} total={totals[index] ?? '—'} {index} />
					{/each}
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
