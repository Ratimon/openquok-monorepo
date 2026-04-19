<script lang="ts">
	import { onMount } from 'svelte';

	import type { KonvaCanvasApi, TextPresetId } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import {
		canvasDesignRepository,
		type PolotnoTextTemplateRowProgrammerModel
	} from '$lib/canvas/CanvasDesign.repository.svelte';
	import { injectGoogleFont, loadFont } from '$lib/ui/canvas-editor/utils';
	import { IsMobile } from '$lib/ui/helpers/is-mobile.svelte';
	import { icons } from '$data/icon';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import { Dropzone } from '$lib/ui/dropzone';
	import { cn } from '$lib/ui/helpers/common';
	import * as Collapsible from '$lib/ui/collapsible';
	import * as Tabs from '$lib/ui/tabs';
	import { ScrollArea } from '$lib/ui/scroll-area';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
	};

	let { disabled = false, canvasApi }: Props = $props();

	const isMobile = new IsMobile();

	const polotnoKey =
		(typeof import.meta.env.VITE_POLOTNO_API_KEY === 'string' && import.meta.env.VITE_POLOTNO_API_KEY) ||
		'';

	let tab = $state('text');
	/** Collapsed by default so Polotno styles get more vertical space. */
	let quickTextOpen = $state(false);

	let textTemplateRows = $state<PolotnoTextTemplateRowProgrammerModel[]>([]);
	let templatesLoading = $state(true);
	let templatesError = $state<string | null>(null);

	const STORAGE_KEY = 'oquok-canvas-fonts-v1';
	type StoredFont = { id: string; family: string; url: string };
	let customFonts = $state<StoredFont[]>([]);
	let fontDropzoneFiles = $state<FileList | null>(null);

	const DEFAULT_FONT_STACK = 'Roboto, system-ui, sans-serif';

	const presets: {
		id: TextPresetId;
		label: string;
		/** Visual tier: featured = dark panel (e.g. “Create header”). */
		tier: 'featured' | 'emphasis' | 'body';
	}[] = [
		{ id: 'header', label: 'Create header', tier: 'featured' },
		{ id: 'subheader', label: 'Create sub header', tier: 'emphasis' },
		{ id: 'body', label: 'Create body text', tier: 'body' }
	];

	function persistFonts(list: StoredFont[]) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
		} catch {
			/* ignore quota */
		}
	}

	async function registerFontFace(f: StoredFont) {
		const face = new FontFace(f.family, `url(${f.url})`);
		await face.load();
		document.fonts.add(face);
	}

	onMount(() => {
		void canvasDesignRepository
			.fetchPolotnoTextTemplatesListPm({ apiKey: polotnoKey })
			.then((d) => {
				textTemplateRows = d.items ?? [];
				templatesLoading = false;
			})
			.catch((e: unknown) => {
				templatesError = e instanceof Error ? e.message : String(e);
				templatesLoading = false;
			});

		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw) as StoredFont[];
			if (!Array.isArray(parsed)) return;
			customFonts = parsed;
			void Promise.all(customFonts.map((f) => registerFontFace(f).catch(() => {})));
		} catch {
			/* ignore */
		}
	});

	function dragPayloadPreset(preset: TextPresetId, fontFamily?: string) {
		return JSON.stringify({
			type: 'design-text-preset',
			preset,
			...(fontFamily ? { fontFamily } : {})
		});
	}

	function dragPayloadTemplate(jsonUrl: string) {
		return JSON.stringify({
			type: 'design-text-template',
			jsonUrl
		});
	}

	function processFontFiles(files: FileList | null | undefined) {
		if (!files?.length) return;
		for (const file of files) {
			if (!/\.(ttf|otf|woff2?|eot)$/i.test(file.name)) continue;
			const url = URL.createObjectURL(file);
			const base = file.name.replace(/\.[^.]+$/, '');
			const family = base.replace(/,/g, '').trim() || 'CustomFont';
			const id = crypto.randomUUID();
			const entry: StoredFont = { id, family, url };
			void registerFontFace(entry)
				.then(() => {
					customFonts = [...customFonts, entry];
					persistFonts(customFonts);
				})
				.catch(() => URL.revokeObjectURL(url));
		}
	}

	function handleFontDropzoneChange() {
		processFontFiles(fontDropzoneFiles);
		fontDropzoneFiles = null;
	}

	function handleFontDropzoneDrop(event: DragEvent) {
		const fromTransfer = event.dataTransfer?.files?.length ? event.dataTransfer.files : null;
		processFontFiles(fromTransfer ?? fontDropzoneFiles);
		fontDropzoneFiles = null;
	}

	function removeFont(f: StoredFont) {
		const stack = `${f.family}, sans-serif`;
		canvasApi?.retargetTextFontFamily(stack, DEFAULT_FONT_STACK);
		URL.revokeObjectURL(f.url);
		customFonts = customFonts.filter((x) => x.id !== f.id);
		persistFonts(customFonts);
	}

	function addPreset(preset: TextPresetId, fontFamily?: string) {
		if (!canvasApi) return;
		if (fontFamily) {
			injectGoogleFont(fontFamily);
			void loadFont(fontFamily);
		}
		canvasApi.addTextPreset(preset, fontFamily ? { fontFamily } : undefined);
	}

	function addFromCustomFont(f: StoredFont) {
		addPreset('body', `${f.family}, sans-serif`);
	}

	let applyingTemplate = $state(false);

	async function applyTextTemplateRow(row: PolotnoTextTemplateRowProgrammerModel) {
		if (disabled || !canvasApi || applyingTemplate) return;
		applyingTemplate = true;
		try {
			const res = await fetch(row.json);
			const json: unknown = await res.json();
			await canvasApi.applyPolotnoTextTemplate(json);
		} finally {
			applyingTemplate = false;
		}
	}

	function presetButtonClass(tier: 'featured' | 'emphasis' | 'body'): string {
		if (tier === 'featured') {
			return 'border-base-content/10 bg-base-300/55 hover:bg-base-300/70 border px-3 py-2.5 text-center shadow-sm';
		}
		if (tier === 'emphasis') {
			return 'hover:bg-base-200/35 border-base-300/70 bg-transparent px-3 py-2 text-center';
		}
		return 'hover:bg-base-200/25 text-base-content/90 px-3 py-1.5 text-center text-sm font-normal';
	}

	function presetLabelClass(tier: 'featured' | 'emphasis' | 'body'): string {
		if (tier === 'featured') return 'text-lg font-bold leading-tight tracking-tight';
		if (tier === 'emphasis') return 'text-sm font-semibold leading-snug';
		return 'text-sm leading-snug';
	}
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-hidden">
	<Tabs.Root bind:value={tab} defaultValue="text" class="flex min-h-0 min-w-0 flex-1 flex-col gap-0">
		<Tabs.List class="w-full shrink-0 gap-0 rounded-lg bg-base-200/50 p-1 !border-0">
			<Tabs.Trigger value="text" class="flex-1">
				Text
			</Tabs.Trigger>
			<Tabs.Trigger value="fonts" class="flex-1">
				My fonts
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="text" class="flex min-h-0 min-w-0 flex-1 flex-col gap-0 !pt-3">
			<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-hidden">
				<Collapsible.Root bind:open={quickTextOpen} class="shrink-0">
					<Collapsible.Trigger class="hover:bg-base-200/40 mb-1 border-base-300/60 !px-2 !py-1.5 text-xs">
						<span class="text-base-content/85">Create header, subheading & body</span>
						<AbstractIcon
							name={icons.ChevronDown.name}
							class="size-4 shrink-0 transition-transform duration-200 {quickTextOpen
								? 'rotate-180'
								: ''}"
							width="16"
							height="16"
						/>
					</Collapsible.Trigger>
					<Collapsible.Content class="!text-xs">
						<p class="text-base-content/50 mb-2 px-0.5 text-[11px] leading-snug">
							{#if isMobile.current}
								Tap a style to add text. Drag onto the canvas to place.
							{:else}
								Click to add centered text, or drag onto the canvas.
							{/if}
						</p>
						<div class="flex flex-col gap-1.5 pb-1">
							{#each presets as p (p.id)}
								<button
									type="button"
									class="w-full rounded-lg font-medium transition-colors disabled:opacity-40 {presetButtonClass(
										p.tier
									)}"
									style="font-family: Roboto, system-ui, sans-serif"
									disabled={disabled || !canvasApi}
									draggable={!disabled && !!canvasApi}
									ondragstart={(e) => {
										e.dataTransfer?.setData('application/json', dragPayloadPreset(p.id));
										if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
									}}
									onclick={() => addPreset(p.id)}
								>
									<span class="text-base-content block {presetLabelClass(p.tier)}">
										{p.label}
									</span>
								</button>
							{/each}
						</div>
					</Collapsible.Content>
				</Collapsible.Root>

				<p class="text-base-content/60 mt-3 mb-2 shrink-0 text-center text-[11px]">
					Styles from
					<ExternalLink
						href="https://polotno.com/"
						class="text-primary font-medium hover:underline"
						ariaLabel="Polotno (opens in a new tab)"
					>
						Polotno
					</ExternalLink>
				</p>

				{#if templatesError}
					<p class="text-error mb-2 shrink-0 text-xs">{templatesError}</p>
				{/if}

				<ScrollArea
					class="min-h-0 min-w-0 flex-1 basis-0"
					viewportClass="pr-1"
				>
					{#if templatesLoading}
						<p class="text-base-content/60 py-8 text-center text-sm">Loading text styles…</p>
					{:else}
						<div class="grid grid-cols-2 gap-x-3 gap-y-4 pb-4">
							{#each textTemplateRows as item (item.preview + item.json)}
								<button
									type="button"
									class="border-primary/35 hover:border-primary/60 bg-primary/20 group relative flex w-full min-h-0 flex-col overflow-hidden rounded-lg border p-2 text-left shadow-sm transition-colors disabled:opacity-40"
									disabled={disabled || !canvasApi || applyingTemplate}
									draggable={!disabled && !!canvasApi}
									ondragstart={(e) => {
										e.dataTransfer?.setData(
											'application/json',
											dragPayloadTemplate(item.json)
										);
										if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
									}}
									onclick={() => void applyTextTemplateRow(item)}
								>
									<img
										src={item.preview}
										alt=""
										class="text-template-preview-img pointer-events-none mx-auto h-auto min-h-28 w-full max-w-full max-h-[min(22rem,42vh)] object-contain"
										loading="lazy"
										draggable="false"
									/>
								</button>
							{/each}
						</div>
					{/if}
				</ScrollArea>
			</div>
		</Tabs.Content>

		<Tabs.Content value="fonts" class="flex min-h-0 min-w-0 flex-1 flex-col gap-2 !pt-3">
			<div class="flex shrink-0 flex-col gap-1.5">
				<Dropzone
					id="design-font-upload"
					bind:files={fontDropzoneFiles}
					accept=".ttf,.otf,.woff,.woff2,.eot"
					multiple
					disabled={disabled}
					class={cn(
						'!h-auto min-h-0 w-full gap-1 border-dashed border-base-300 bg-base-200/60 py-2 hover:bg-base-300/40',
						disabled && 'pointer-events-none opacity-50'
					)}
					onDrop={handleFontDropzoneDrop}
					onChange={handleFontDropzoneChange}
				>
					<AbstractIcon
						name={icons.FileText.name}
						class="size-6 shrink-0 text-base-content/45"
						width="24"
						height="24"
					/>
					<div class="flex flex-col gap-0.5 px-1 text-center">
						<span class="text-xs font-medium leading-tight text-base-content">
							Drop fonts here or click to browse
						</span>
						<span class="text-[10px] leading-snug text-base-content/65">
							Prefer <span class="font-medium text-base-content/80">.ttf</span> or
							<span class="font-medium text-base-content/80">.otf</span>. WOFF, WOFF2, EOT OK. Local only.
						</span>
					</div>
				</Dropzone>
			</div>
			<ScrollArea class="min-h-0 min-w-0 flex-1 basis-0" viewportClass="pr-1">
				{#each customFonts as f (f.id)}
					<div class="border-base-300 mb-1.5 last:mb-0 relative overflow-hidden rounded-lg border">
						<button
							type="button"
							class="bg-primary/25 hover:bg-primary/35 text-primary-content flex min-h-[4.25rem] w-full items-center justify-center px-2 py-2 pr-9 text-center text-lg leading-snug transition-colors disabled:opacity-40"
							style="font-family: {f.family}, sans-serif"
							disabled={disabled || !canvasApi}
							draggable={!disabled && !!canvasApi}
							ondragstart={(e) => {
								e.dataTransfer?.setData(
									'application/json',
									dragPayloadPreset('body', `${f.family}, sans-serif`)
								);
								if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
							}}
							onclick={() => addFromCustomFont(f)}
						>
							<span class="line-clamp-2 max-w-full break-words">{f.family} text</span>
						</button>
						<button
							type="button"
							class="text-primary-content/80 hover:text-error absolute right-0.5 bottom-0.5 rounded p-1"
							title="Remove font"
							onclick={(e) => {
								e.stopPropagation();
								removeFont(f);
							}}
						>
							<AbstractIcon name={icons.Trash.name} class="size-4" width="16" height="16" />
						</button>
					</div>
				{/each}
				{#if customFonts.length === 0}
					<p class="text-base-content/50 py-8 text-center text-sm">No custom fonts yet.</p>
				{/if}
			</ScrollArea>
		</Tabs.Content>
	</Tabs.Root>
</div>

<style>
	/* Remote text-style thumbnails assume a light UI; invert under forest (`data-theme`) for contrast. */
	:global(html[data-theme='forest']) :global(img.text-template-preview-img) {
		filter: invert(1);
	}
</style>
