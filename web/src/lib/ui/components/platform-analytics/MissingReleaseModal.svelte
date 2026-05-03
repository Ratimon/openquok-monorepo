<script lang="ts">
	import type { ProtectedCalendarPagePresenter } from '$lib/area-protected/ProtectedCalendarPage.presenter.svelte';

    import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		postId: string;
		organizationId: string;
		loadMissingCandidates: ProtectedCalendarPagePresenter['loadMissingPublishCandidatesForPost'];
		updatePostRelease: ProtectedCalendarPagePresenter['updatePostReleaseIdForStatistics'];
		onSuccess: () => void;
		onCancel: () => void;
	};

	let { postId, organizationId, loadMissingCandidates, updatePostRelease, onSuccess, onCancel }: Props =
		$props();

	let loading = $state(true);
	let items = $state<{ id: string; url: string }[]>([]);
	let selected = $state<string | null>(null);
	let saving = $state(false);

	async function load(): Promise<void> {
		loading = true;
		const r = await loadMissingCandidates({ postId, organizationId });
		loading = false;
		if (r.ok) {
			items = r.items;
		} else {
			items = [];
		}
	}

	$effect(() => {
		void postId;
		void organizationId;
		void load();
	});

	async function handleConnect(): Promise<void> {
		if (!selected) return;
		saving = true;
		const r = await updatePostRelease({
			postId,
			organizationId,
			releaseId: selected
		});
		saving = false;
		if (r.ok) {
			toast.success('Post connected.');
			onSuccess();
			return;
		}
		toast.warning(r.error);
	}
</script>

{#if loading}
	<div class="flex items-center justify-center py-10 text-sm text-base-content/70">
		<AbstractIcon name={icons.LoaderCircle.name} class="h-5 w-5 animate-spin" width="20" height="20" />
		<span class="ms-2">Loading…</span>
	</div>
{:else if items.length === 0}
	<div class="py-6 text-center text-sm text-base-content/70">
		No content found from this provider. The provider may not support this feature.
	</div>
{:else}
	<div class="flex flex-col gap-4">
		<p class="text-sm text-base-content/70">
			Select the content that matches this post:
		</p>
		<div
			class="scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-200 max-h-[400px] overflow-y-auto p-1"
		>
			<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
				{#each items as item (item.id)}
					<button
						type="button"
						class="relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:opacity-95 {selected === item.id
							? 'border-primary scale-[1.02] shadow-sm'
							: 'border-transparent hover:border-base-content/20'}"
						onclick={() => (selected = item.id)}
						aria-pressed={selected === item.id}
					>
						<img src={item.url} alt="" class="size-full object-cover" />
					</button>
				{/each}
			</div>
		</div>

		<div class="flex justify-end gap-2 border-t border-base-300 pt-3">
			<Button type="button" variant="outline" onclick={onCancel} disabled={saving}>
				Cancel</Button>
			<Button type="button" variant="primary" disabled={!selected || saving} onclick={() => void handleConnect()}>
				{#if saving}
					<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
				{/if}
				Connect post
			</Button>
		</div>
	</div>
{/if}
