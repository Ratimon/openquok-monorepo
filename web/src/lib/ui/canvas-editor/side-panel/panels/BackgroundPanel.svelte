<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import type {
		BackgroundPanelViewModel,
		PolotnoUnsplashListPageProgrammerModel,
		StockPhotoViewModel
	} from '$lib/canvas';

	import { onMount } from 'svelte';

	import { createInfiniteApi } from '$lib/canvas/utils/useInfiniteApi.svelte';

	import { icons } from '$data/icons';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import ColorPicker from '$lib/ui/color-picker/ColorPicker.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as InputGroup from '$lib/ui/input-group';
	import * as Popover from '$lib/ui/popover';
	import { ScrollArea } from '$lib/ui/scroll-area';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		/** From {@link GenerateMediaModalPresenter} (not the repository). */
		backgroundPanelVm: BackgroundPanelViewModel;
	};

	const BG_COLOR_PRESETS = [
		'white',
		'rgb(82, 113, 255)',
		'rgb(255, 145, 77)',
		'rgb(126, 217, 87)',
		'rgb(255, 222, 89)',
		'rgb(203, 108, 230)',
		'rgb(0, 0, 0)',
		'rgba(0, 0, 0, 0)'
	] as const;

	const CHECKER_BG =
		'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%278%27 height=%278%27 viewBox=%270 0 8 8%27%3E%3Cg fill=%27rgba(112,112,116,1)%27%3E%3Cpath fill-rule=%27evenodd%27 d=%27M0 0h4v4H0V0zm4 4h4v4H4V4z%27/%3E%3C/g%3E%3C/svg%3E")';

	const UNSPLASH_HOME =
		'https://unsplash.com/?utm_source=polotno&utm_medium=referral';

	let { disabled = false, canvasApi, backgroundPanelVm }: Props = $props();

	let pickerColor = $state('#FFFFFF');
	let colorPopoverOpen = $state(false);
	let search = $state('');
	let loadSentinel = $state.raw<HTMLDivElement | null>(null);
	let scrollViewport = $state.raw<HTMLDivElement | null>(null);

	const infinite = createInfiniteApi<PolotnoUnsplashListPageProgrammerModel>({
		defaultQuery: 'gradient',
		fetchPage: (ctx, signal) =>
			backgroundPanelVm.fetchPolotnoUnsplashPagePm(
				{
					query: ctx.query.trim() || 'gradient',
					page: ctx.page
				},
				signal
			),
		getSize: (p) => p.totalPages
	});

	const busy = $derived(disabled || !canvasApi);

	const stockRows = $derived(infinite.items as StockPhotoViewModel[]);

	let skipSearchEffect = true;
	$effect(() => {
		search;
		if (skipSearchEffect) {
			skipSearchEffect = false;
			return;
		}
		infinite.setQuery(search.trim() || 'gradient');
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

	function setBackground(fill: string) {
		canvasApi?.setPageBackground(fill);
	}

	function applyPickerColor() {
		setBackground(pickerColor);
		colorPopoverOpen = false;
	}

	function onPickUnsplashPhoto(p: StockPhotoViewModel) {
		backgroundPanelVm.triggerPolotnoUnsplashDownloadPm(p.id);
		setBackground(p.fullUrl);
	}
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
	<p class="text-base-content/70 shrink-0 text-xs leading-snug">
		Page fill inside the frame. Pick a color or a stock photo as the background.
	</p>

	<div class="flex shrink-0 flex-wrap items-center justify-center gap-2 border-b border-base-300/80 pb-3">
		<Popover.Root bind:open={colorPopoverOpen}>
			<Popover.Trigger
				type="button"
				class="border-base-300 relative size-[30px] shrink-0 overflow-hidden rounded-sm border shadow-sm disabled:opacity-40"
				style={`background-image:${CHECKER_BG};`}
				disabled={busy}
				aria-label="Custom color"
			>
				<div class="absolute inset-0" style:background-color={pickerColor}></div>
				<AbstractIcon
					name={icons.Sparkles.name}
					class="relative z-10 mx-auto block size-4 mix-blend-difference"
					width="16"
					height="16"
				/>
			</Popover.Trigger>
			<Popover.Content class="w-auto max-w-[min(100vw-2rem,320px)] p-3" align="center" sideOffset={6}>
				<ColorPicker bind:value={pickerColor} />
				<Button type="button" variant="primary" size="sm" class="mt-3 w-full" onclick={applyPickerColor}>
					Apply
				</Button>
			</Popover.Content>
		</Popover.Root>

		{#each BG_COLOR_PRESETS as color (color)}
			<button
				type="button"
				title={color === 'rgba(0, 0, 0, 0)' ? 'Transparent' : color}
				class="border-base-300 size-[30px] shrink-0 rounded-sm border shadow-sm disabled:opacity-40"
				style:background-image={color === 'rgba(0, 0, 0, 0)' ? CHECKER_BG : undefined}
				style:background-color={color === 'rgba(0, 0, 0, 0)' ? 'transparent' : color}
				disabled={busy}
				onclick={() => setBackground(color)}
			></button>
		{/each}
	</div>

	<label class="sr-only" for="design-background-search">
		Search backgrounds</label>
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
			id="design-background-search"
			type="search"
			bind:value={search}
			placeholder="Search…"
			class="text-sm"
		/>
	</InputGroup.Root>

	<p class="text-base-content/70 shrink-0 text-center text-xs">
		Photos by
		<ExternalLink
			href={UNSPLASH_HOME}
			class="text-primary font-medium hover:underline"
			ariaLabel="Unsplash (opens in a new tab)"
		>
			Unsplash
		</ExternalLink>
	</p>

	{#if infinite.error}
		<p class="text-error shrink-0 text-xs">
			{String(infinite.error)}</p>
	{/if}

	<ScrollArea class="min-h-0 min-w-0 flex-1 basis-0" viewportClass="pr-0.5" bind:viewportRef={scrollViewport}>
		<div class="grid min-w-0 grid-cols-2 content-start gap-2 pb-2">
			{#each stockRows as p (p.id)}
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<div
					class="border-base-300 hover:border-primary/50 group relative aspect-[4/5] w-full min-w-0 overflow-hidden rounded-lg border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary {busy
						? 'cursor-not-allowed opacity-40'
						: 'cursor-pointer'}"
					role="button"
					tabindex={busy ? -1 : 0}
					onclick={() => !busy && onPickUnsplashPhoto(p)}
					onkeydown={(e) => !busy && e.key === 'Enter' && onPickUnsplashPhoto(p)}
				>
					<img
						src={p.thumbUrl}
						alt=""
						class="pointer-events-none h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
						loading="lazy"
						draggable="false"
					/>
					{#if p.photographerName && p.photographerHref}
						<div
							class="absolute right-0 bottom-0 left-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-6 pb-1"
							onclick={(e) => e.stopPropagation()}
							onkeydown={(e) => e.stopPropagation()}
							role="presentation"
						>
							<ExternalLink
								href={p.photographerHref}
								class="text-[10px] leading-tight text-white hover:underline"
								ariaLabel="Photo author on Unsplash (opens in a new tab)"
							>
								{p.photographerName}
							</ExternalLink>
						</div>
					{/if}
				</div>
			{/each}

			{#if infinite.isLoading && stockRows.length === 0}
				<div class="text-base-content/60 col-span-2 py-8 text-center text-sm">
					Loading photos…</div>
			{/if}

			{#if infinite.hasMore}
				<div bind:this={loadSentinel} class="col-span-2 h-6 shrink-0" aria-hidden="true"></div>
			{/if}

			{#if infinite.isLoading && stockRows.length > 0}
				<div class="text-base-content/55 col-span-2 py-2 text-center text-xs">
					Loading more…</div>
			{/if}

			{#if !infinite.isLoading && stockRows.length === 0 && !infinite.error}
				<p class="text-base-content/60 col-span-2 px-1 py-6 text-center text-sm">
					{#if search.trim()}
						No photos match “{search.trim()}”. Try another word (e.g. gradient, ocean).
					{:else}
						No photos to show.
					{/if}
				</p>
			{/if}
		</div>
	</ScrollArea>
</div>
