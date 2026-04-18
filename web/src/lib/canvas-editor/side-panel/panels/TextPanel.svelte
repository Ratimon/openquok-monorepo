<script lang="ts">
	import type { KonvaCanvasApi, TextPresetId } from '$lib/canvas-editor/canvas/konvaCanvasApi';
	import { getFontsList, injectGoogleFont, loadFont } from '$lib/canvas-editor/utils';

	import { onMount } from 'svelte';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
	};

	let { disabled = false, canvasApi }: Props = $props();

	type TextSubtab = 'presets' | 'fonts';
	let subtab = $state<TextSubtab>('presets');

	const STORAGE_KEY = 'oquok-canvas-fonts-v1';
	type StoredFont = { id: string; family: string; url: string };
	let customFonts = $state<StoredFont[]>([]);
	let fontInput = $state.raw<HTMLInputElement | undefined>(undefined);

	const DEFAULT_FONT_STACK = 'Roboto, system-ui, sans-serif';
	const quickFonts = getFontsList();

	const presets: { id: TextPresetId; label: string; sampleClass: string }[] = [
		{ id: 'header', label: 'Add a heading', sampleClass: 'text-[22px] font-bold' },
		{ id: 'subheader', label: 'Add a subheading', sampleClass: 'text-lg' },
		{ id: 'body', label: 'Add body text', sampleClass: 'text-sm' }
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

	function dragPayload(preset: TextPresetId, fontFamily?: string) {
		return JSON.stringify({
			type: 'design-text-preset',
			preset,
			...(fontFamily ? { fontFamily } : {})
		});
	}

	function onFontPick(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const files = input.files;
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
		input.value = '';
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
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
	<div class="border-base-300 bg-base-200/50 flex shrink-0 rounded-lg border p-0.5">
		<button
			type="button"
			class="flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors {subtab === 'presets'
				? 'bg-base-100 text-base-content shadow-sm'
				: 'text-base-content/60 hover:text-base-content/90'}"
			onclick={() => (subtab = 'presets')}
		>
			Text
		</button>
		<button
			type="button"
			class="flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors {subtab === 'fonts'
				? 'bg-base-100 text-base-content shadow-sm'
				: 'text-base-content/60 hover:text-base-content/90'}"
			onclick={() => (subtab = 'fonts')}
		>
			My fonts
		</button>
	</div>

	{#if subtab === 'presets'}
		<p class="text-base-content/55 shrink-0 text-xs">
			Click to add centered on the page, or drag onto the canvas to place at the drop point.
		</p>
		<div class="border-base-300 bg-base-200/50 shrink-0 rounded-lg border p-2">
			<p class="text-base-content/70 mb-1 text-[11px] font-medium">Quick fonts</p>
			<div class="flex flex-wrap gap-1.5">
				{#each quickFonts.slice(0, 8) as f (f)}
					<button
						type="button"
						class="border-base-300 hover:border-primary/50 bg-base-100/80 rounded-full border px-2 py-1 text-[11px] leading-none"
						style:font-family={`'${f}', system-ui, sans-serif`}
						disabled={disabled || !canvasApi}
						onclick={() => addPreset('body', `${f}, system-ui, sans-serif`)}
					>
						{f}
					</button>
				{/each}
			</div>
		</div>
		<div class="custom-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
			{#each presets as p (p.id)}
				<button
					type="button"
					class="border-base-300 hover:border-primary/50 w-full rounded-lg border px-3 py-2.5 text-left transition-colors disabled:opacity-40"
					disabled={disabled || !canvasApi}
					draggable={!disabled && !!canvasApi}
					ondragstart={(e) => {
						e.dataTransfer?.setData('application/json', dragPayload(p.id));
						if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
					}}
					onclick={() => addPreset(p.id)}
				>
					<span
						class="text-base-content block {p.sampleClass}"
						style="font-family: Roboto, system-ui, sans-serif"
					>
						{p.label}
					</span>
				</button>
			{/each}
		</div>
	{:else}
		<div class="flex shrink-0 flex-col gap-2">
			<input
				bind:this={fontInput}
				id="design-font-upload"
				type="file"
				accept=".ttf,.otf,.woff,.woff2,.eot"
				class="hidden"
				onchange={onFontPick}
			/>
			<Button
				type="button"
				variant="outline"
				size="sm"
				class="w-full gap-2"
				disabled={disabled}
				onclick={() => fontInput?.click()}
			>
				<AbstractIcon name={icons.FileText.name} class="size-4" width="16" height="16" />
				Upload font
			</Button>
			<p class="text-base-content/55 text-xs">TTF, OTF, WOFF, or WOFF2. Stored in this browser only.</p>
		</div>
		<div class="custom-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
			{#each customFonts as f (f.id)}
				<div class="border-base-300 relative overflow-hidden rounded-lg border">
					<button
						type="button"
						class="hover:bg-base-200/40 min-h-[100px] w-full px-3 py-3 text-center text-[25px] text-white transition-colors disabled:opacity-40"
						style="background-color: rgba(0,0,0,0.4)"
						disabled={disabled || !canvasApi}
						draggable={!disabled && !!canvasApi}
						ondragstart={(e) => {
							e.dataTransfer?.setData(
								'application/json',
								dragPayload('body', `${f.family}, sans-serif`)
							);
							if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
						}}
						onclick={() => addFromCustomFont(f)}
					>
						{f.family} text
					</button>
					<button
						type="button"
						class="text-base-content/80 hover:text-error absolute right-1 bottom-1 rounded p-1"
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
				<p class="text-base-content/50 py-6 text-center text-sm">No custom fonts yet.</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar {
		scrollbar-width: thin;
	}
</style>
