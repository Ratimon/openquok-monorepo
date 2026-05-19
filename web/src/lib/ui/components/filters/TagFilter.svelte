<script lang="ts">
	import type { CalendarPostRowViewModel, PostTagFilterVm, PostTagViewModel } from '$lib/posts';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { Badge } from '$lib/ui/badge';
	import { Checkbox } from '$lib/ui/checkbox';
	import * as Popover from '$lib/ui/popover';

	type Props = PostTagFilterVm & {
		tagsVm: PostTagViewModel[];
		posts?: readonly Pick<CalendarPostRowViewModel, 'tagNames'>[];
		onChange: (next: PostTagFilterVm) => void;
	};

	let { tagsVm, posts = [], allTags, selectedTagNames, onChange }: Props = $props();

	let open = $state(false);

	const normalizedSelected = $derived.by(() =>
		selectedTagNames.map((x) => String(x ?? '').trim()).filter(Boolean)
	);

	const tagRows = $derived.by(() => {
		const map = new Map<string, { name: string; color: string | null }>();
		for (const t of tagsVm) {
			const name = String(t.name ?? '').trim();
			if (!name) continue;
			map.set(name, { name, color: t.color?.trim() || null });
		}
		for (const p of posts) {
			for (const raw of p.tagNames ?? []) {
				const name = String(raw ?? '').trim();
				if (!name || map.has(name)) continue;
				const fromVm = tagsVm.find((t) => t.name === name);
				map.set(name, { name, color: fromVm?.color?.trim() || null });
			}
		}
		for (const s of normalizedSelected) {
			if (!map.has(s)) map.set(s, { name: s, color: null });
		}
		return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
	});

	const allTagNames = $derived.by(() => tagRows.map((t) => t.name));

	const effectiveSelected = $derived.by(() => (allTags ? allTagNames : normalizedSelected));

	const summary = $derived.by(() => {
		if (allTags) return 'All tags';
		const n = normalizedSelected.length;
		if (n === 0) return 'Select tags';
		if (n === 1) return normalizedSelected[0] ?? '1 tag';
		return `${n} tags`;
	});

	function setAll(next: boolean) {
		if (next) {
			onChange({ allTags: true, selectedTagNames: allTagNames });
			return;
		}
		onChange({ allTags: false, selectedTagNames });
	}

	function toggleTag(name: string) {
		const key = String(name ?? '').trim();
		if (!key) return;
		const set = new Set(normalizedSelected);
		if (set.has(key)) set.delete(key);
		else set.add(key);
		onChange({ allTags: false, selectedTagNames: [...set] });
	}

	function removeSelected(name: string) {
		const key = String(name ?? '').trim();
		onChange({ allTags: false, selectedTagNames: normalizedSelected.filter((x) => x !== key) });
	}

	const colorByName = $derived.by(
		() => new Map(tagRows.map((t) => [t.name, t.color] as const))
	);

	const selectedBadges = $derived.by(() =>
		effectiveSelected.map((name) => ({
			id: name,
			label: name,
			color: colorByName.get(name) ?? null
		}))
	);

</script>

<Popover.Root bind:open>
	<Popover.Trigger
		type="button"
		class="border-base-300 bg-base-100/60 hover:bg-base-100 inline-flex max-w-full min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm text-base-content/80 outline-none focus-visible:ring-2 focus-visible:ring-primary sm:max-w-[min(100%,280px)]"
	>
		<AbstractIcon name={icons.Tags.name} class="size-4 shrink-0" width="16" height="16" />
		<span class="min-w-0 truncate">{summary}</span>
		<AbstractIcon name={icons.ChevronDown.name} class="size-4 shrink-0" width="16" height="16" />
	</Popover.Trigger>

	<Popover.Content
		align="start"
		side="bottom"
		sideOffset={8}
		collisionPadding={16}
		class="w-[min(calc(100vw-2rem),320px)] p-3 shadow-xl"
	>
		<p class="px-1 pb-2 text-xs font-semibold text-base-content/60">Tags</p>

		<div class="flex items-center justify-between gap-2 px-1 pb-2">
			<label class="flex cursor-pointer items-center gap-2 rounded-md">
				<Checkbox checked={allTags} onCheckedChange={() => setAll(!allTags)} />
				<span class="text-sm leading-snug">All tags</span>
			</label>

			{#if normalizedSelected.length > 0}
				<button
					type="button"
					class="text-xs font-medium text-base-content/70 underline-offset-2 hover:underline"
					onclick={() => onChange({ allTags: false, selectedTagNames: [] })}
				>
					Clear
				</button>
			{/if}
		</div>

		{#if selectedBadges.length > 0}
			<div class="flex flex-wrap gap-2 px-1 pb-2">
				{#each selectedBadges as b (b.id)}
					<Badge variant="secondary" class="rounded-full gap-1.5 pr-1">
						{#if b.color}
							<span
								class="size-2.5 shrink-0 rounded-full border border-base-content/10"
								style:background-color={b.color}
								aria-hidden="true"
							></span>
						{/if}
						{b.label}
						<button
							type="button"
							class="ml-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
							aria-label={`Remove ${b.label}`}
							onclick={() => {
								if (allTags) {
									onChange({
										allTags: false,
										selectedTagNames: allTagNames.filter((x) => x !== b.id)
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
			{#each tagRows as t (t.name)}
				<label
					class="hover:bg-base-200 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 {!allTags && normalizedSelected.includes(t.name)
						? 'bg-base-200/80'
						: ''}"
				>
					<Checkbox
						checked={effectiveSelected.includes(t.name)}
						onCheckedChange={() => {
							if (allTags) {
								onChange({
									allTags: false,
									selectedTagNames: allTagNames.filter((x) => x !== t.name)
								});
							} else {
								toggleTag(t.name);
							}
						}}
						class="mt-0.5"
					/>
					{#if t.color}
						<span
							class="mt-1 size-3 shrink-0 rounded-full border border-base-content/10"
							style:background-color={t.color}
							aria-hidden="true"
						></span>
					{/if}
					<span class="text-sm leading-snug">{t.name}</span>
				</label>
			{/each}
		</div>
	</Popover.Content>
</Popover.Root>
