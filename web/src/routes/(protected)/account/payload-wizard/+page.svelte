<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { CreatePostProgrammerModel, RepeatIntervalKey } from '$lib/posts';

	import { getRootPathAccount, protectedDashboardPagePresenter } from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { route } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const connectedChannelsVm = $derived(protectedDashboardPagePresenter.connectedChannelsVm);
	const listStatus = $derived(protectedDashboardPagePresenter.listStatus);
	const channelsLoadPending = $derived(listStatus === 'idle' || listStatus === 'loading');

	type WizardStatus = CreatePostProgrammerModel['status'];

	let selectedIntegrationIds = $state<string[]>([]);
	let isGlobal = $state(true);
	let status = $state<WizardStatus>('scheduled');
	let scheduledAt = $state<string>(new Date(Date.now() + 60 * 60 * 1000).toISOString());
	let repeatInterval = $state<RepeatIntervalKey | ''>('');
	let tagNamesCsv = $state('');
	let body = $state('');

	const repeatIntervalChoices: { value: RepeatIntervalKey; label: string }[] = [
		{ value: 'day', label: 'Daily' },
		{ value: 'two_days', label: 'Every 2 days' },
		{ value: 'three_days', label: 'Every 3 days' },
		{ value: 'four_days', label: 'Every 4 days' },
		{ value: 'five_days', label: 'Every 5 days' },
		{ value: 'six_days', label: 'Every 6 days' },
		{ value: 'week', label: 'Weekly' },
		{ value: 'two_weeks', label: 'Every 2 weeks' },
		{ value: 'month', label: 'Monthly' }
	];

	function toTagNames(csv: string): string[] {
		return csv
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	function setSelectedAll(channels: CreateSocialPostChannelViewModel[]): void {
		selectedIntegrationIds = channels.map((c) => c.id).filter(Boolean);
	}

	function toggleIntegrationId(id: string): void {
		if (!id) return;
		if (selectedIntegrationIds.includes(id)) {
			selectedIntegrationIds = selectedIntegrationIds.filter((x) => x !== id);
			return;
		}
		selectedIntegrationIds = [...selectedIntegrationIds, id];
	}

	const payload = $derived.by((): CreatePostProgrammerModel | null => {
		const oid = workspaceId;
		if (!oid) return null;
		if (!selectedIntegrationIds.length) return null;
		const trimmedBody = body.trim();
		if (!trimmedBody) return null;
		const at = scheduledAt.trim();
		if (!at) return null;

		return {
			organizationId: oid,
			body: trimmedBody,
			integrationIds: selectedIntegrationIds,
			isGlobal,
			scheduledAt: at,
			repeatInterval: repeatInterval ? repeatInterval : null,
			tagNames: toTagNames(tagNamesCsv),
			status
		};
	});

	async function copyPayload(): Promise<void> {
		if (!payload) {
			toast.error('Fill out required fields to generate a payload.');
			return;
		}
		try {
			await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
			toast.success('Payload copied to clipboard.');
		} catch {
			toast.error('Could not copy to clipboard.');
		}
	}

	$effect(() => {
		const oid = workspaceId;
		if (!oid) return;
		void protectedDashboardPagePresenter.loadDashboardLists();
	});

	$effect(() => {
		if (!selectedIntegrationIds.length && connectedChannelsVm.length) {
			setSelectedAll(connectedChannelsVm);
		}
	});
</script>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-5">
	<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div class="space-y-1">
				<div class="flex items-center gap-3">
					<AbstractIcon name={icons.Sparkles.name} class="text-primary size-8 shrink-0" width="32" height="32" />
					<h1 class="text-2xl font-bold text-base-content">
						Payload Wizard
					</h1>
				</div>
				<p class="text-sm text-base-content/70">
					Build a JSON payload for <span class="font-mono text-base-content">POST /api/v1/posts</span>, then copy it.
				</p>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="outline" href={accountPath}>
					<AbstractIcon name={icons.ArrowLeft.name} class="size-4" width="16" height="16" />
					Back
				</Button>
			</div>
		</div>

		{#if !workspaceId}
			<div class="rounded-lg border border-base-300 bg-base-200 p-4">
				<p class="text-sm text-base-content/70">
					Select a workspace first (top-left switcher), then reopen this wizard.
				</p>
			</div>
		{:else if channelsLoadPending}
			<p class="flex items-center gap-2 text-sm text-base-content/70">
				<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
				Loading channels…
			</p>
		{:else if listStatus === 'error'}
			<p class="text-sm text-error">
				Could not load channels. Try again in a moment.
			</p>
		{:else if connectedChannelsVm.length === 0}
			<div class="rounded-lg border border-base-300 bg-base-200 p-4">
				<p class="text-sm text-base-content/70">
					No connected channels found for this workspace. Connect a channel first.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div class="space-y-4">
					<div class="rounded-lg border border-base-300 bg-base-100 p-4 space-y-3">
						<div class="flex items-center justify-between gap-3">
							<h2 class="text-base font-semibold text-base-content">Channels</h2>
							<div class="flex items-center gap-2">
								<Button
									variant="secondary"
									size="sm"
									type="button"
									onclick={() => setSelectedAll(connectedChannelsVm)}
								>
									Select all
								</Button>
								<Button
									variant="warning"
									size="sm"
									type="button"
									onclick={() => (selectedIntegrationIds = [])
								}>
									Clear
								</Button>
							</div>
						</div>
						<ul class="space-y-2">
							{#each connectedChannelsVm as ch (ch.id)}
								<li class="flex items-center justify-between gap-3 rounded-md border border-base-300 bg-base-200/40 px-3 py-2">
									<div class="min-w-0">
										<p class="truncate text-sm font-medium text-base-content">
											{ch.name || ch.identifier || ch.id}
										</p>
										<p class="truncate text-xs text-base-content/60">
											{ch.identifier}
											<span class="mx-1 opacity-50">•</span>
											{ch.id}
										</p>
									</div>
									<label class="flex shrink-0 items-center gap-2 text-sm text-base-content">
										<input
											type="checkbox"
											class="checkbox checkbox-sm"
											checked={selectedIntegrationIds.includes(ch.id)}
											onchange={() => toggleIntegrationId(ch.id)}
										/>
										<span class="sr-only">Select channel</span>
									</label>
								</li>
							{/each}
						</ul>
					</div>

					<div class="rounded-lg border border-base-300 bg-base-100 p-4 space-y-3">
						<h2 class="text-base font-semibold text-base-content">Post</h2>

						<label class="block space-y-1">
							<span class="text-sm font-medium text-base-content">Body *</span>
							<textarea
								class="textarea textarea-bordered w-full bg-base-100"
								rows="6"
								placeholder="Write your post content…"
								bind:value={body}
							></textarea>
						</label>

						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<label class="block space-y-1">
								<span class="text-sm font-medium text-base-content">Status</span>
								<select class="select select-bordered w-full bg-base-100" bind:value={status}>
									<option value="scheduled">scheduled</option>
									<option value="draft">draft</option>
								</select>
							</label>

							<label class="block space-y-1">
								<span class="text-sm font-medium text-base-content">Repeat interval</span>
								<select class="select select-bordered w-full bg-base-100" bind:value={repeatInterval}>
									<option value="">none</option>
									{#each repeatIntervalChoices as c (c.value)}
										<option value={c.value}>{c.label}</option>
									{/each}
								</select>
							</label>
						</div>

						<label class="block space-y-1">
							<span class="text-sm font-medium text-base-content">Scheduled at (ISO) *</span>
							<input
								class="input input-bordered w-full bg-base-100 font-mono text-sm"
								placeholder="2026-05-06T08:00:00.000Z"
								bind:value={scheduledAt}
							/>
						</label>

						<label class="flex items-center justify-between gap-3 rounded-md border border-base-300 bg-base-200/40 px-3 py-2">
							<div class="min-w-0">
								<p class="text-sm font-medium text-base-content">Global body</p>
								<p class="text-xs text-base-content/60">Single body shared across all selected integrations.</p>
							</div>
							<input type="checkbox" class="toggle toggle-primary" bind:checked={isGlobal} />
						</label>

						<label class="block space-y-1">
							<span class="text-sm font-medium text-base-content">Tags</span>
							<input
								class="input input-bordered w-full bg-base-100"
								placeholder="launch, promo, threads"
								bind:value={tagNamesCsv}
							/>
							<p class="text-xs text-base-content/60">
								Comma-separated tag names. (Wizard outputs <span class="font-mono">tagNames: string[]</span>)
							</p>
						</label>
					</div>
				</div>

				<div class="space-y-4">
					<div class="rounded-lg border border-base-300 bg-base-100 p-4 space-y-3">
						<div class="flex items-center justify-between gap-3">
							<h2 class="text-base font-semibold text-base-content">Generated payload</h2>
							<Button
								variant="primary"
								type="button"
								class="gap-2"
								disabled={!payload}
								onclick={() => void copyPayload()}
							>
								<AbstractIcon name={icons.Copy.name} class="size-4" width="16" height="16" />
								Copy JSON
							</Button>
						</div>

						{#if payload}
							<pre class="overflow-x-auto rounded-md border border-base-300 bg-base-200/40 p-4 text-xs text-base-content"><code>{JSON.stringify(
										payload,
										null,
										2
									)}</code></pre>
						{:else}
							<div class="rounded-md border border-base-300 bg-base-200/40 p-4">
								<p class="text-sm text-base-content/70">
									Select at least 1 channel and fill required fields (<span class="font-medium text-base-content">Body</span> +
									<span class="font-medium text-base-content">Scheduled at</span>) to generate a payload.
								</p>
							</div>
						{/if}
					</div>

					<div class="rounded-lg border border-base-300 bg-base-100 p-4 space-y-2">
						<h2 class="text-base font-semibold text-base-content">Endpoint</h2>
						<p class="text-sm text-base-content/70">
							Send this payload to <span class="font-mono text-base-content">POST /api/v1/posts</span> with your session cookie or
							API authentication.
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

