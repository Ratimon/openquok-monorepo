<script lang="ts">
	import type { PostTagProgrammerModel } from '$lib/posts';
	import { icons } from '$data/icon';
	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ColorPicker from '$lib/ui/color-picker/ColorPicker.svelte';

	type Props = {
		tagList: PostTagProgrammerModel[];
		selectedTagNames: string[];
		busy?: boolean;
		onToggleTag: (name: string) => void;
		onAddTag: (name?: string, color?: string) => void | Promise<void>;
	};

	let {
		tagList,
		selectedTagNames,
		busy = false,
		onToggleTag,
		onAddTag
	}: Props = $props();

	let open = $state(false);
	let addOpen = $state(false);
	let allowClose = $state(true);

	let addName = $state('');
	let addColor = $state('#942828');

	const selectedTags = $derived.by(() =>
		selectedTagNames
			.map((name) => tagList.find((t) => t.name === name) ?? { id: name, name })
			.filter(Boolean)
	);

	const primary = $derived(selectedTags[0] ?? null);

	function closeDropdown() {
		open = false;
	}

	$effect(() => {
		if (!open) return;
		if (typeof window === 'undefined') return;
		const handler = (e: MouseEvent) => {
			if (!allowClose) return;
			const el = e.target as HTMLElement | null;
			if (!el) return;
			if (el.closest('[data-tags-root]')) return;
			closeDropdown();
		};
		window.addEventListener('click', handler, true);
		return () => window.removeEventListener('click', handler, true);
	});

	function openAddModal() {
		addName = '';
		addColor = '#942828';
		addOpen = true;
		open = false;
	}

	async function confirmAdd() {
		const t = addName.trim();
		if (!t) return;
		allowClose = false;
		try {
			await onAddTag(t, addColor);
			addOpen = false;
		} finally {
			setTimeout(() => (allowClose = true), 200);
		}
	}
</script>

<div class="relative shrink-0" data-tags-root>
	<button
		type="button"
		class="border-base-300 bg-base-100/60 hover:bg-base-100 inline-flex h-[44px] min-w-[240px] max-w-[280px] items-center gap-2 rounded-lg border px-3 text-sm font-semibold text-base-content/90 outline-none focus-visible:ring-2 focus-visible:ring-primary"
		aria-haspopup="menu"
		aria-expanded={open}
		disabled={busy}
		onclick={() => (open = !open)}
	>
		<AbstractIcon name={icons.Tag.name} class="size-4" width="16" height="16" />

		<span class="flex min-w-0 flex-1 items-center gap-2">
			{#if primary}
				<span
					class="text-shadow-tags inline-flex items-center rounded-md px-2 py-1 text-xs text-white"
					style={`background-color:${primary.color ?? '#6366f1'}`}
				>
					{primary.name}
				</span>
				{#if selectedTags.length > 1}
					<span class="text-xs text-base-content/70">+{selectedTags.length - 1}</span>
				{/if}
			{:else}
				<span class="truncate text-base-content/70">Add New Tag</span>
			{/if}
		</span>

		<AbstractIcon
			name={open ? icons.ChevronUp.name : icons.ChevronDown.name}
			class="size-4"
			width="16"
			height="16"
		/>
	</button>

	{#if open}
		<div
			class="border-base-300 bg-base-100 absolute left-0 bottom-full z-50 mb-2 w-[260px] rounded-lg border p-2 shadow-xl"
			role="menu"
		>
			<div class="max-h-[260px] overflow-y-auto">
				{#each tagList as t (t.id)}
					<button
						type="button"
						class="hover:bg-base-200 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm"
						onclick={() => onToggleTag(t.name)}
					>
						<input
							type="checkbox"
							class="checkbox checkbox-xs checkbox-primary"
							checked={selectedTagNames.includes(t.name)}
							readonly
							tabindex="-1"
						/>
						<span
							class="text-shadow-tags inline-flex items-center rounded-md px-2 py-1 text-xs text-white"
							style={`background-color:${t.color ?? '#6366f1'}`}
						>
							{t.name}
						</span>
					</button>
				{/each}
			</div>

			<div class="mt-2">
				<Button type="button" variant="primary" size="sm" class="w-full" onclick={openAddModal}>
					<span class="inline-flex items-center justify-center gap-2">
						<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
						Add New Tag
					</span>
				</Button>
			</div>
		</div>
	{/if}
</div>

<Dialog.Root bind:open={addOpen}>
	<Dialog.Content class="w-[min(92vw,720px)] max-w-[min(92vw,720px)]" showCloseButton={false}>
		<div class="flex items-start justify-between gap-3">
			<Dialog.Header class="space-y-2 text-start">
				<Dialog.Title class="text-2xl font-semibold">Add New Tag</Dialog.Title>
			</Dialog.Header>
			<button
				type="button"
				class="hover:bg-base-200 rounded-md p-2 text-base-content/70 outline-none focus-visible:ring-2 focus-visible:ring-primary"
				onclick={() => (addOpen = false)}
				aria-label="Close"
			>
				<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
			</button>
		</div>

		<div class="mt-6 space-y-5">
			<div class="space-y-2">
				<label class="text-sm font-medium text-base-content/80" for="tag-name">Name</label>
				<input
					id="tag-name"
					class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
					placeholder="Tag name"
					bind:value={addName}
					onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), void confirmAdd())}
				/>
			</div>

			<div class="space-y-2">
				<div class="text-sm font-medium text-base-content/80">Tag Color</div>
				<ColorPicker bind:value={addColor} />
			</div>
		</div>

		<div class="mt-6 flex flex-wrap gap-3">
			<Button type="button" variant="primary" onclick={() => void confirmAdd()} disabled={!addName.trim().length}>
				Save
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
