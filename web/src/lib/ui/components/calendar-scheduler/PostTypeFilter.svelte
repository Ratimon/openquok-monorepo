<script lang="ts">
	import type { PostStateFilterVm } from '$lib/posts';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { Badge } from '$lib/ui/badge';
	import { Checkbox } from '$lib/ui/checkbox';

	type Props = PostStateFilterVm & {
		onChange: (next: PostStateFilterVm) => void;
	};

	let { allPostStates, selectedPostStates, onChange }: Props = $props();

	let open = $state(false);

	const KNOWN_STATES = ['QUEUE', 'DRAFT', 'PUBLISHED', 'ERROR', 'REPEATING'] as const;

	const normalizedSelected = $derived.by(() =>
		selectedPostStates
			.map((x) => String(x).toUpperCase().trim())
			.filter(Boolean)
	);

	const allStates = $derived.by(() => {
		const set = new Set<string>(KNOWN_STATES);
		for (const s of normalizedSelected) set.add(s);
		return [...set.values()];
	});

	const effectiveSelected = $derived.by(() => (allPostStates ? allStates : normalizedSelected));

	const summary = $derived.by(() => {
		if (allPostStates) return 'All post types';
		const n = normalizedSelected.length;
		if (n === 0) return 'Select post types';
		if (n === 1) return normalizedSelected[0] ?? '1 type';
		return `${n} types`;
	});

	function close() {
		open = false;
	}

	function setAll(next: boolean) {
		if (next) {
			onChange({ allPostStates: true, selectedPostStates: allStates });
			return;
		}
		onChange({ allPostStates: false, selectedPostStates });
	}

	function toggleState(state: string) {
		const up = String(state).toUpperCase().trim();
		if (!up) return;
		const set = new Set(normalizedSelected);
		if (set.has(up)) set.delete(up);
		else set.add(up);
		onChange({ allPostStates: false, selectedPostStates: [...set] });
	}

	function removeSelected(state: string) {
		const up = String(state).toUpperCase().trim();
		onChange({ allPostStates: false, selectedPostStates: normalizedSelected.filter((x) => x !== up) });
	}

	const selectedBadges = $derived.by(() =>
		effectiveSelected.map((s) => ({
			id: s,
			label: s
		}))
	);

	$effect(() => {
		if (!open) return;
		if (typeof window === 'undefined') return;
		const handler = (e: MouseEvent) => {
			const el = e.target as HTMLElement | null;
			if (!el) return;
			if (el.closest('[data-post-type-filter-root]')) return;
			close();
		};
		window.addEventListener('click', handler, true);
		return () => window.removeEventListener('click', handler, true);
	});
</script>

<div class="relative" data-post-type-filter-root>
	<button
		type="button"
		class="border-base-300 bg-base-100/60 hover:bg-base-100 inline-flex max-w-[min(100%,280px)] items-center gap-2 rounded-lg border px-3 py-2 text-sm text-base-content/80 outline-none focus-visible:ring-2 focus-visible:ring-primary"
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<AbstractIcon name={icons.Tag.name} class="size-4 shrink-0" width="16" height="16" />
		<span class="min-w-0 truncate">{summary}</span>
		<AbstractIcon name={icons.ChevronDown.name} class="size-4 shrink-0" width="16" height="16" />
	</button>

	{#if open}
		<div
			class="border-base-300 bg-base-100 absolute left-0 z-[60] mt-2 w-[min(calc(100vw-2rem),320px)] rounded-lg border p-3 shadow-xl sm:left-auto sm:right-0"
			role="menu"
		>
			<p class="px-1 pb-2 text-xs font-semibold text-base-content/60">Post types</p>

			<div class="flex items-center justify-between gap-2 px-1 pb-2">
				<label class="flex cursor-pointer items-center gap-2 rounded-md">
					<Checkbox checked={allPostStates} onCheckedChange={() => setAll(!allPostStates)} />
					<span class="text-sm leading-snug">All post types</span>
				</label>

				{#if normalizedSelected.length > 0}
					<button
						type="button"
						class="text-xs font-medium text-base-content/70 underline-offset-2 hover:underline"
						onclick={() => onChange({ allPostStates: false, selectedPostStates: [] })}
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
									if (allPostStates) {
										onChange({
											allPostStates: false,
											selectedPostStates: allStates.filter((x) => x !== b.id)
										});
									} else {
										removeSelected(b.id);
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
				{#each allStates as s (s)}
					<label class="hover:bg-base-200 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 {!allPostStates && normalizedSelected.includes(s) ? 'bg-base-200/80' : ''}">
						<Checkbox
							checked={effectiveSelected.includes(s)}
							onCheckedChange={() => {
								if (allPostStates) {
									onChange({ allPostStates: false, selectedPostStates: allStates.filter((x) => x !== s) });
								} else {
									toggleState(s);
								}
							}}
							class="mt-0.5"
						/>
						<span class="text-sm leading-snug">{s}</span>
					</label>
				{/each}
			</div>
		</div>
	{/if}
</div>

