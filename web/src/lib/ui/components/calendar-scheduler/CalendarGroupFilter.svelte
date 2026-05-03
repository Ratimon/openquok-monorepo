<script lang="ts">
	import type { ChannelViewModel } from '$lib/posts';
	import { CALENDAR_UNGROUPED_SENTINEL } from '$lib/posts';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { Badge } from '$lib/ui/badge';
	import { Checkbox } from '$lib/ui/checkbox';

	type ChannelGroup = { id: string; name: string };

	type Props = {
		channels: ChannelViewModel[];
		allGroups: boolean;
		selectedGroupIds: string[];
		onChange: (next: { allGroups: boolean; selectedGroupIds: string[] }) => void;
	};

	let { channels, allGroups, selectedGroupIds, onChange }: Props = $props();

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

	const hasUngrouped = $derived(channels.some((c) => !c.group));

	const allIds = $derived.by(() => {
		const ids = groups.map((g) => g.id);
		if (hasUngrouped) ids.push(CALENDAR_UNGROUPED_SENTINEL);
		return ids;
	});

	const effectiveSelectedIds = $derived.by(() => (allGroups ? allIds : selectedGroupIds));

	const summary = $derived.by(() => {
		if (allGroups) return 'All groups';
		const n = selectedGroupIds.length;
		if (n === 0) return 'Select groups';
		if (n === 1) {
			const id = selectedGroupIds[0];
			if (id === CALENDAR_UNGROUPED_SENTINEL) return 'Ungrouped only';
			return groups.find((g) => g.id === id)?.name ?? '1 group';
		}
		return `${n} groups`;
	});

	function close() {
		open = false;
	}

	function setAllGroups(next: boolean) {
		if (next) {
			onChange({ allGroups: true, selectedGroupIds: allIds });
			return;
		}
		// Leaving "all groups" puts the filter into explicit selection mode.
		// Start with the current selection (often empty), and let the user pick.
		onChange({ allGroups: false, selectedGroupIds });
	}

	function toggleGroupId(id: string) {
		const set = new Set(selectedGroupIds);
		if (set.has(id)) {
			set.delete(id);
		} else {
			set.add(id);
		}
		onChange({ allGroups: false, selectedGroupIds: [...set] });
	}

	function removeSelectedId(id: string) {
		onChange({ allGroups: false, selectedGroupIds: selectedGroupIds.filter((x) => x !== id) });
	}

	const selectedBadges = $derived.by(() => {
		const byId = new Map(groups.map((g) => [g.id, g.name] as const));
		return effectiveSelectedIds
			.map((id) => ({
				id,
				label: id === CALENDAR_UNGROUPED_SENTINEL ? 'Ungrouped channels' : byId.get(id) ?? 'Group'
			}))
			.filter((x) => Boolean(x.label));
	});

	$effect(() => {
		if (!open) return;
		if (typeof window === 'undefined') return;
		const handler = (e: MouseEvent) => {
			const el = e.target as HTMLElement | null;
			if (!el) return;
			if (el.closest('[data-calendar-group-filter-root]')) return;
			close();
		};
		window.addEventListener('click', handler, true);
		return () => window.removeEventListener('click', handler, true);
	});
</script>

<div class="relative" data-calendar-group-filter-root>
	<button
		type="button"
		class="border-base-300 bg-base-100/60 hover:bg-base-100 inline-flex max-w-[min(100%,280px)] items-center gap-2 rounded-lg border px-3 py-2 text-sm text-base-content/80 outline-none focus-visible:ring-2 focus-visible:ring-primary"
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<AbstractIcon name={icons.User1.name} class="size-4 shrink-0" width="16" height="16" />
		<span class="min-w-0 truncate">{summary}</span>
		<AbstractIcon name={icons.ChevronDown.name} class="size-4 shrink-0" width="16" height="16" />
	</button>

	{#if open}
		<div
			class="border-base-300 bg-base-100 absolute left-0 z-[60] mt-2 w-[min(calc(100vw-2rem),320px)] rounded-lg border p-3 shadow-xl sm:left-auto sm:right-0"
			role="menu"
		>
			<p class="px-1 pb-2 text-xs font-semibold text-base-content/60">
				Channel groups</p>

			<div class="flex items-center justify-between gap-2 px-1 pb-2">
				<label class="flex cursor-pointer items-center gap-2 rounded-md">
					<Checkbox checked={allGroups} onCheckedChange={() => setAllGroups(!allGroups)} />
					<span class="text-sm leading-snug">All groups</span>
				</label>

				{#if selectedGroupIds.length > 0}
					<button
						type="button"
						class="text-xs font-medium text-base-content/70 underline-offset-2 hover:underline"
						onclick={() => onChange({ allGroups: false, selectedGroupIds: [] })}
					>
						Clear
					</button>
				{/if}
			</div>

			{#if selectedBadges.length > 0}
				<div class="flex flex-wrap gap-2 px-1 pb-2">
					{#each selectedBadges as b (b.id)}
						<Badge variant="secondary" class="rounded-full">
							{b.label}
							<button
								type="button"
								class="ml-1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
								aria-label={`Remove ${b.label}`}
								onclick={() => {
									if (allGroups) {
										onChange({
											allGroups: false,
											selectedGroupIds: allIds.filter((x) => x !== b.id)
										});
									} else {
										removeSelectedId(b.id);
									}
								}}
							>
								<AbstractIcon name={icons.X2.name} width="10" height="10" />
							</button>
						</Badge>
					{/each}
				</div>
			{/if}

			<div class="divider my-1"></div>

			<div class="max-h-[min(50vh,280px)] space-y-1 overflow-y-auto">
				{#each groups as g (g.id)}
					<label class="hover:bg-base-200 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 {!allGroups && selectedGroupIds.includes(g.id) ? 'bg-base-200/80' : ''}">
						<Checkbox
							checked={effectiveSelectedIds.includes(g.id)}
							onCheckedChange={() => {
								if (allGroups) onChange({ allGroups: false, selectedGroupIds: allIds.filter((x) => x !== g.id) });
								else toggleGroupId(g.id);
							}}
							class="mt-0.5"
						/>
						<span class="text-sm leading-snug">{g.name}</span>
					</label>
				{/each}

				{#if hasUngrouped}
					<label class="hover:bg-base-200 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 {!allGroups && selectedGroupIds.includes(CALENDAR_UNGROUPED_SENTINEL) ? 'bg-base-200/80' : ''}">
						<Checkbox
							checked={effectiveSelectedIds.includes(CALENDAR_UNGROUPED_SENTINEL)}
							onCheckedChange={() => {
								if (allGroups) onChange({ allGroups: false, selectedGroupIds: allIds.filter((x) => x !== CALENDAR_UNGROUPED_SENTINEL) });
								else toggleGroupId(CALENDAR_UNGROUPED_SENTINEL);
							}}
							class="mt-0.5"
						/>
						<span class="text-sm leading-snug">Ungrouped channels</span>
					</label>
				{/if}
			</div>
		</div>
	{/if}
</div>
