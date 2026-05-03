<script lang="ts">
	import type { SetProgrammerModel } from '$lib/sets';

	import { setsRepository, parseSetContent } from '$lib/sets';
	import { protectedDashboardPagePresenter } from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';

	import Button from '$lib/ui/buttons/Button.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { icons } from '$data/icons';

	let sets = $state<SetProgrammerModel[]>([]);
	let loading = $state(false);
	let composeOpen = $state(false);

	let composePresenter = $state.raw(protectedDashboardPagePresenter.createSocialPostPresenter);

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	async function reload() {
		const oid = workspaceId;
		if (!oid) {
			sets = [];
			return;
		}
		loading = true;
		try {
			const res = await setsRepository.listForOrganization(oid);
			sets = res.ok ? res.items : [];
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

	function openEditSet(row: SetProgrammerModel) {
		const oid = workspaceId;
		if (!oid) return;
		const snap = parseSetContent(row.content);
		if (!snap) {
			window.alert('This set uses an unsupported format and cannot be edited.');
			return;
		}
		void protectedDashboardPagePresenter.loadDashboardLists();
		composePresenter.prepareContentSetAuthoring({ editingSetId: row.id, snapshot: snap });
		composeOpen = true;
	}

	async function deleteSet(row: SetProgrammerModel) {
		if (!workspaceId) return;
		const ok = confirm(`Delete set "${row.name}"?`);
		if (!ok) return;
		const res = await setsRepository.deleteById(row.id);
		if (!res.ok) {
			window.alert(res.error);
			return;
		}
		await reload();
	}

</script>

<div class="flex flex-col gap-3">
	<h3 class="text-xl font-semibold text-base-content">
		Sets ({sets.length})
	</h3>
	<p class="text-base-content/70 text-sm">
		Manage reusable combinations of channels and draft content for faster scheduling.
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
		{:else if sets.length === 0}
			<Button type="button" variant="primary" onclick={openNewSetModal}>
				Add a set
			</Button>
		{:else}
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_auto_auto] sm:items-center sm:gap-4">
				<div class="text-base-content/70 hidden text-xs font-medium uppercase sm:block">
					Name</div>
				<div class="hidden sm:block"></div>
				<div class="hidden sm:block"></div>
				{#each sets as row (row.id)}
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
