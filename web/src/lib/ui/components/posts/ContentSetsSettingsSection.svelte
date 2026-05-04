<script lang="ts">
	import type { SetRowViewModel } from '$lib/sets';

	import { getSetPresenter, upsertSetPresenter } from '$lib/sets';
	import { getRootPathAccount, getRootPathTemplates, protectedDashboardPagePresenter } from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { route } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { icons } from '$data/icons';

	let setsVm = $state<SetRowViewModel[]>([]);
	let loading = $state(false);
	let composeOpen = $state(false);

	let composePresenter = $state.raw(protectedDashboardPagePresenter.createSocialPostPresenter);

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	const templatesSetsPath = $derived(
		route(`${getRootPathAccount()}/${getRootPathTemplates()}`)
	);

	async function reload() {
		const oid = workspaceId;
		if (!oid) {
			setsVm = [];
			return;
		}
		loading = true;
		try {
			const resultVm = await getSetPresenter.loadSetsListVm(oid);
			setsVm = resultVm.ok ? resultVm.rows : [];
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		const oid = workspaceId;
		if (!oid) return;
		void reload();
	});

	function openNewSetModal() {
		const oid = workspaceId;
		if (!oid) return;
		void protectedDashboardPagePresenter.loadDashboardLists();
		composePresenter.prepareContentSetAuthoring({});
		composeOpen = true;
	}

	function openEditSet(row: SetRowViewModel) {
		const oid = workspaceId;
		if (!oid) return;
		const snap = getSetPresenter.parseSnapshotFromContentStateless(row.content);
		if (!snap) {
			window.alert('This set uses an unsupported format and cannot be edited.');
			return;
		}
		void protectedDashboardPagePresenter.loadDashboardLists();
		composePresenter.prepareContentSetAuthoring({
			editingSetId: row.id,
			editingSetName: row.name,
			snapshot: snap
		});
		composeOpen = true;
	}

	async function deleteSet(row: SetRowViewModel) {
		if (!workspaceId) return;
		const ok = confirm(`Delete set "${row.name}"?`);
		if (!ok) return;
		const resultVm = await upsertSetPresenter.deleteSet(row.id);
		if (!resultVm.ok) {
			window.alert(resultVm.error);
			return;
		}
		await reload();
	}

</script>

<div class="flex flex-col gap-3">
	<h3 class="text-xl font-semibold text-base-content">
		Sets ({setsVm.length})
	</h3>
	<p class="text-base-content/70 text-sm">
		Manage reusable combinations of channels and draft content for faster scheduling.
	</p>
	<p class="text-base-content/70 text-sm">
		For a sortable table of all sets (parsed from each row’s stored content), open
		<a href={templatesSetsPath} class="link link-primary font-medium">Templates</a> in the main account menu.
	</p>

	<div class="border-base-300 bg-base-200/40 rounded-lg border p-6">
		{#if !workspaceId}
			<p class="text-base-content/70 text-sm">
				Select a workspace to manage sets.
			</p>
		{:else if loading}
			<p class="text-base-content/70 flex items-center gap-2 text-sm">
				<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
				Loading sets…
			</p>
		{:else if setsVm.length === 0}
			<Button type="button" variant="primary" onclick={openNewSetModal}>
				Add a set
			</Button>
		{:else}
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_auto_auto] sm:items-center sm:gap-4">
				<div class="text-base-content/70 hidden text-xs font-medium uppercase sm:block">
					Name</div>
				<div class="hidden sm:block"></div>
				<div class="hidden sm:block"></div>
				{#each setsVm as row (row.id)}
					<div class="text-base-content font-medium">
						{row.name}</div>
					<Button
						type="button"
						size="sm"
						variant="outline"
						onclick={() => openEditSet(row)}
					>
						Edit
					</Button>
					<Button
						type="button"
						size="sm"
						variant="red"
						onclick={() => void deleteSet(row)}
					>
						Delete
					</Button>
				{/each}
			</div>
			<div class="mt-6">
				<Button type="button" variant="primary" onclick={openNewSetModal}>
					Add a set
				</Button>
			</div>
		{/if}
	</div>
</div>

<CreateSocialPostModal
	bind:open={composeOpen}
	bind:presenter={composePresenter}
	workspaceId={workspaceId}
	connectedChannels={protectedDashboardPagePresenter.connectedChannelsVm}
	uploadUid={workspaceId ?? ''}
	closeComposerAfterSaveSet={true}
	onContentSetSaved={() => void reload()}
/>
