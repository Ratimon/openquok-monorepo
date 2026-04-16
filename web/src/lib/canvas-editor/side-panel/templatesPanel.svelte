<script lang="ts">
	import { tick } from 'svelte';

	import type { KonvaCanvasApi } from '$lib/canvas-editor/konvaCanvasApi';
	import { DESIGN_TEMPLATES, type DesignTemplate } from '$lib/canvas-editor/side-panel/templatesPanelData';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		/** Current canvas aspect preset id (e.g. "16:9"). */
		aspectRatioId: string;
		onAspectChange?: (id: string) => void;
	};

	let { disabled = false, canvasApi, aspectRatioId, onAspectChange }: Props = $props();

	let query = $state('');
	let matchCurrentFrame = $state(true);

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return DESIGN_TEMPLATES.filter((t) => {
			if (q && !t.label.toLowerCase().includes(q) && !(t.description?.toLowerCase().includes(q) ?? false)) {
				return false;
			}
			if (!matchCurrentFrame) return true;
			if (t.universal) return true;
			return t.aspectRatioId === aspectRatioId;
		});
	});

	async function applyTemplate(t: DesignTemplate) {
		if (disabled || !canvasApi) return;
		if (t.suggestAspectRatioId && t.suggestAspectRatioId !== aspectRatioId) {
			onAspectChange?.(t.suggestAspectRatioId);
			await tick();
		}
		canvasApi.applyTemplateDoc(t.doc, 'reset');
	}
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
	<label class="sr-only" for="design-template-search">Search templates</label>
	<div class="relative">
		<AbstractIcon
			name={icons.Search.name}
			class="text-base-content/40 pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2"
			width="16"
			height="16"
		/>
		<input
			id="design-template-search"
			type="search"
			bind:value={query}
			placeholder="Search templates…"
			class="border-base-300 bg-base-200/80 focus:border-primary focus:ring-primary/25 w-full rounded-md border py-2 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
		/>
	</div>

	<label class="flex cursor-pointer items-center justify-between gap-2 text-sm">
		<span class="text-base-content/80">Match current frame</span>
		<input
			type="checkbox"
			bind:checked={matchCurrentFrame}
			class="toggle toggle-primary toggle-sm"
		/>
	</label>
	<p class="text-base-content/55 text-xs">
		When on, only presets that fit the current aspect (or universal presets) are listed.
	</p>

	<div class="custom-scrollbar grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto pr-1">
		{#each filtered as t (t.id)}
			<button
				type="button"
				class="border-base-300 hover:border-primary/50 group flex aspect-[4/5] w-full flex-col overflow-hidden rounded-md border text-left transition-colors disabled:opacity-40"
				disabled={disabled || !canvasApi}
				onclick={() => void applyTemplate(t)}
			>
				<div class="bg-base-300/40 relative aspect-[4/5] w-full shrink-0 overflow-hidden">
					<img
						src={t.previewUrl}
						alt=""
						class="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
						loading="lazy"
					/>
				</div>
				<div class="border-base-300/80 bg-base-100/90 flex min-h-0 flex-1 flex-col gap-0.5 border-t p-2">
					<span class="text-xs leading-tight font-medium">{t.label}</span>
					{#if t.description}
						<span class="text-base-content/55 line-clamp-2 text-[10px] leading-snug">{t.description}</span>
					{/if}
				</div>
			</button>
		{/each}
	</div>
</div>

<style>
	.custom-scrollbar {
		scrollbar-width: thin;
	}
</style>
