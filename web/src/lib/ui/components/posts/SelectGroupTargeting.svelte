<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type ChannelGroup = { id: string; name: string };

	type Props = {
		channels: CreateSocialPostChannelViewModel[];
		selectedGroupId?: string | null;
		onSelect: (groupId: string | null) => void;
	};

	let { channels, selectedGroupId = null, onSelect }: Props = $props();
	let open = $state(false);

	const groups = $derived.by(() => {
		const map = new Map<string, ChannelGroup>();
		for (const c of channels) {
			if (c.group?.id) {
				map.set(c.group.id, { id: c.group.id, name: c.group.name });
			}
		}
		return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
	});

	const selectedName = $derived.by(() => {
		if (!selectedGroupId) return null;
		return groups.find((g) => g.id === selectedGroupId)?.name ?? null;
	});

	function close() {
		open = false;
	}

	$effect(() => {
		if (!open) return;
		if (typeof window === 'undefined') return;
		const handler = (e: MouseEvent) => {
			const el = e.target as HTMLElement | null;
			if (!el) return;
			if (el.closest('[data-group-dropdown-root]')) return;
			close();
		};
		window.addEventListener('click', handler, true);
		return () => window.removeEventListener('click', handler, true);
	});
</script>


<div class="relative" data-group-dropdown-root>
	<button
		type="button"
		class="border-base-300 bg-base-100/60 hover:bg-base-100 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-base-content/80 outline-none focus-visible:ring-2 focus-visible:ring-primary"
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<AbstractIcon name={icons.User1.name} class="size-4" width="16" height="16" />
		<span class="max-w-[220px] truncate">
			{selectedName ?? 'Select grouped channels'}
		</span>
		<AbstractIcon name={icons.ChevronDown.name} class="size-4" width="16" height="16" />
	</button>

	{#if open}
		<div
			class="border-base-300 bg-base-100 absolute right-0 z-50 mt-2 w-[280px] rounded-lg border p-2 shadow-xl"
			role="menu"
		>
			<div class="px-2 py-1 text-xs font-semibold text-base-content/60">Groups</div>
			<button
				type="button"
				class="hover:bg-base-200 w-full rounded-md px-2 py-2 text-left text-sm {selectedGroupId === null
					? 'bg-base-200'
					: ''}"
				onclick={() => (onSelect(null), close())}
			>
				All groups
			</button>
			{#each groups as g (g.id)}
				<button
					type="button"
					class="hover:bg-base-200 w-full rounded-md px-2 py-2 text-left text-sm {selectedGroupId === g.id
						? 'bg-base-200'
						: ''}"
					onclick={() => (onSelect(g.id), close())}
				>
					{g.name}
				</button>
			{/each}
		</div>
	{/if}
</div>

