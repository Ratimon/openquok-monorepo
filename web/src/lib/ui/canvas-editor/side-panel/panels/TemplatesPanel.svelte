<script lang="ts">
	import { onMount, tick } from 'svelte';

	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import type { AspectRatioPreset } from '$lib/ui/canvas-editor/utils/aspectRatioPresets';
	import {
		canvasDesignRepository,
		type DesignTemplateProgrammerModel,
		type PolotnoTemplateListPageProgrammerModel,
		type PolotnoTemplateRowProgrammerModel
	} from '$lib/canvas/CanvasDesign.repository.svelte';
	import { polotnoJsonToKonvaDoc } from '$lib/canvas/utils/polotnoToKonvaDoc';
	import { createInfiniteApi } from '$lib/canvas/utils/useInfiniteApi.svelte';
	import * as InputGroup from '$lib/ui/input-group';
	import Switch from '$lib/ui/switch/switch.svelte';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { ScrollArea } from '$lib/ui/scroll-area';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		aspectRatioId: string;
		selectedAspect: AspectRatioPreset;
		onAspectChange?: (id: string) => void;
	};

	let {
		disabled = false,
		canvasApi,
		aspectRatioId,
		selectedAspect,
		onAspectChange
	}: Props = $props();

	const polotnoKey =
		(typeof import.meta.env.VITE_POLOTNO_API_KEY === 'string' && import.meta.env.VITE_POLOTNO_API_KEY) ||
		'';

	let search = $state('');
	let sameSize = $state(true);
	let loadSentinel = $state.raw<HTMLDivElement | null>(null);
	let scrollViewport = $state.raw<HTMLDivElement | null>(null);

	const filteredLocal = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return canvasDesignRepository.listDesignTemplatesPm().filter((t) => {
			if (
				q &&
				!t.label.toLowerCase().includes(q) &&
				!(t.description?.toLowerCase().includes(q) ?? false)
			) {
				return false;
			}
			if (!sameSize) return true;
			if (t.universal) return true;
			return t.aspectRatioId === aspectRatioId;
		});
	});

	const infinite = createInfiniteApi<PolotnoTemplateListPageProgrammerModel>({
		fetchPage: (ctx, signal) =>
			canvasDesignRepository.fetchPolotnoTemplateListPagePm(
				{
					query: ctx.query,
					page: ctx.page,
					sameSizeAsCanvas: sameSize,
					exportWidth: selectedAspect.exportWidth,
					exportHeight: selectedAspect.exportHeight,
					apiKey: polotnoKey
				},
				signal
			),
		getSize: (p) => p.totalPages
	});

	const remoteTemplateRows = $derived(infinite.items as PolotnoTemplateRowProgrammerModel[]);

	const exportWidth = $derived(selectedAspect.exportWidth);
	const exportHeight = $derived(selectedAspect.exportHeight);

	/** Plain `let` so flipping the skip flag does not re-fire this effect (avoids read/write loop). */
	let skipSizeResetOnce = true;
	$effect(() => {
		sameSize;
		exportWidth;
		exportHeight;
		if (skipSizeResetOnce) {
			skipSizeResetOnce = false;
			return;
		}
		queueMicrotask(() => {
			infinite.reset();
		});
	});

	let skipSearchQueryOnce = true;
	$effect(() => {
		search;
		if (skipSearchQueryOnce) {
			skipSearchQueryOnce = false;
			return;
		}
		infinite.setQuery(search);
	});

	onMount(() => {
		infinite.init();
	});

	$effect(() => {
		const el = loadSentinel;
		const root = scrollViewport;
		if (!el || !root) return;
		const o = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) infinite.loadMore();
				}
			},
			{ root, rootMargin: '120px', threshold: 0 }
		);
		o.observe(el);
		return () => o.disconnect();
	});

	async function applyLocalTemplate(t: DesignTemplateProgrammerModel) {
		if (disabled || !canvasApi) return;
		if (t.suggestAspectRatioId && t.suggestAspectRatioId !== aspectRatioId) {
			onAspectChange?.(t.suggestAspectRatioId);
			await tick();
		}
		canvasApi.applyTemplateDoc(t.doc, 'reset');
	}

	let applyingRemote = $state(false);

	async function applyPolotnoRow(row: PolotnoTemplateRowProgrammerModel) {
		if (disabled || !canvasApi || applyingRemote) return;
		applyingRemote = true;
		try {
			const res = await fetch(row.json);
			const json: unknown = await res.json();
			const box = canvasApi.getPageInnerBox();
			const doc = polotnoJsonToKonvaDoc(json, box);
			canvasApi.applyTemplateDoc(doc, 'reset');
		} finally {
			applyingRemote = false;
		}
	}
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
	<label class="sr-only" for="design-template-search">Search templates</label>
	<InputGroup.Root class="shrink-0 shadow-xs">
		<InputGroup.Addon align="inline-start" class="pl-2">
			<AbstractIcon
				name={icons.Search.name}
				class="text-base-content/45 size-4"
				width="16"
				height="16"
			/>
		</InputGroup.Addon>
		<InputGroup.Input
			id="design-template-search"
			type="search"
			bind:value={search}
			placeholder="Search…"
			class="text-sm"
		/>
	</InputGroup.Root>

	<div class="flex shrink-0 items-center justify-between gap-2 text-sm">
		<span class="text-base-content/80">
			Show templates with the same size
		</span>
		<Switch bind:checked={sameSize} class="toggle-sm" disabled={disabled} />
	</div>

	{#if infinite.error}
		<p class="text-error shrink-0 text-xs">{String(infinite.error)}</p>
	{/if}

	<ScrollArea class="min-h-0 min-w-0 flex-1" viewportClass="pr-0.5" bind:viewportRef={scrollViewport}>
		<div class="grid min-w-0 grid-cols-2 content-start items-start gap-2 pb-2">
			{#each filteredLocal as t (t.id)}
				<button
					type="button"
					class="border-base-300 hover:border-primary/50 group flex w-full min-w-0 flex-col gap-0 overflow-hidden rounded-md border p-0 text-left transition-colors disabled:opacity-40"
					disabled={disabled || !canvasApi}
					onclick={() => void applyLocalTemplate(t)}
				>
					<div class="bg-base-300/40 relative aspect-[4/5] w-full shrink-0 overflow-hidden">
						<img
							src={t.previewUrl}
							alt=""
							class="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
							loading="lazy"
						/>
					</div>
					<div class="border-base-300/80 bg-base-100/90 shrink-0 border-t px-2 py-1.5">
						<span class="text-xs leading-tight font-medium">{t.label}</span>
						{#if t.description}
							<span class="text-base-content/55 mt-0.5 line-clamp-2 block text-[10px] leading-snug"
								>{t.description}</span
							>
						{/if}
					</div>
				</button>
			{/each}

			{#each remoteTemplateRows as item (item.preview + item.json)}
				<button
					type="button"
					class="border-base-300 hover:border-primary/50 group relative aspect-[4/5] w-full min-w-0 overflow-hidden rounded-md border text-left transition-colors disabled:opacity-40"
					disabled={disabled || !canvasApi || applyingRemote}
					onclick={() => void applyPolotnoRow(item)}
				>
					<img
						src={item.preview}
						alt=""
						class="pointer-events-none h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
						loading="lazy"
						draggable="false"
					/>
				</button>
			{/each}

			{#if infinite.isLoading && infinite.items.length === 0}
				<div class="text-base-content/60 col-span-2 py-8 text-center text-sm">Loading templates…</div>
			{/if}

			{#if infinite.hasMore}
				<div bind:this={loadSentinel} class="col-span-2 h-6 shrink-0" aria-hidden="true"></div>
			{/if}

			{#if infinite.isLoading && infinite.items.length > 0}
				<div class="text-base-content/55 col-span-2 py-2 text-center text-xs">Loading more…</div>
			{/if}
		</div>
	</ScrollArea>
</div>
