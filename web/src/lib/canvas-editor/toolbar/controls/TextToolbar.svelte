<script lang="ts">
	import type { CanvasSelectionState, KonvaCanvasApi } from '$lib/canvas-editor/canvas/konvaCanvasApi';
	import { getFontsList, injectGoogleFont, loadFont } from '$lib/canvas-editor/utils';
	import * as Popover from '$lib/ui/popover';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		selection: CanvasSelectionState;
	};

	let { disabled = false, canvasApi, selection }: Props = $props();
	let open = $state(false);
	let query = $state('');

	const fonts = $derived.by(() => {
		const base = ['Roboto', ...getFontsList()];
		const uniq = [...new Set(base)];
		const q = query.trim().toLowerCase();
		return q ? uniq.filter((f) => f.toLowerCase().includes(q)) : uniq;
	});

	const isText = $derived(selection.hasSelection && selection.type === 'text' && !!selection.text);

	function pickFont(fontFamily: string) {
		injectGoogleFont(fontFamily);
		void loadFont(fontFamily);
		canvasApi?.setSelectedFontFamily(`${fontFamily}, system-ui, sans-serif`);
	}
</script>

{#if isText}
	<div class="bg-base-300/60 mx-1 hidden h-5 w-px sm:block"></div>

	<Popover.Root bind:open>
		<Popover.Trigger
			type="button"
			class="border-base-300 bg-base-200/70 text-base-content hover:bg-base-300/80 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium sm:text-sm"
			disabled={disabled || !canvasApi}
			title="Font"
			aria-label="Font"
		>
			<span class="max-w-[9rem] truncate">{selection.text?.fontFamily}</span>
		</Popover.Trigger>
		<Popover.Content class="w-72 p-3" align="start" sideOffset={6}>
			<input
				type="search"
				bind:value={query}
				placeholder="Search fonts…"
				class="border-base-300 bg-base-200/80 focus:border-primary focus:ring-primary/25 mb-2 w-full rounded-md border py-2 px-3 text-sm focus:ring-2 focus:outline-none"
			/>
			<div class="max-h-64 overflow-y-auto pr-1">
				{#each fonts as f (f)}
					<button
						type="button"
						class="hover:bg-base-200/60 w-full rounded px-2 py-2 text-left text-sm"
						style:font-family={`'${f}', system-ui, sans-serif`}
						onclick={() => pickFont(f)}
					>
						{f}
					</button>
				{/each}
			</div>
		</Popover.Content>
	</Popover.Root>

	<label class="sr-only" for="text-size">Font size</label>
	<input
		id="text-size"
		type="number"
		min="6"
		value={selection.text?.fontSize ?? 24}
		class="border-base-300 bg-base-200/70 w-16 rounded-full border px-2 py-1 text-center text-xs sm:text-sm"
		disabled={disabled || !canvasApi}
		onchange={(e) => canvasApi?.setSelectedFontSize(Number((e.currentTarget as HTMLInputElement).value))}
	/>

	<label class="sr-only" for="text-color">Text color</label>
	<input
		id="text-color"
		type="color"
		value={selection.text?.fill ?? '#0f172a'}
		class="h-8 w-10 cursor-pointer rounded border border-base-300 bg-base-200/70 p-1"
		disabled={disabled || !canvasApi}
		oninput={(e) => canvasApi?.setSelectedFill((e.currentTarget as HTMLInputElement).value)}
	/>

	<button
		type="button"
		class="btn btn-ghost btn-xs"
		disabled={disabled || !canvasApi}
		aria-label="Bold"
		onclick={() => canvasApi?.toggleSelectedBold()}
	>
		B
	</button>
	<button
		type="button"
		class="btn btn-ghost btn-xs"
		disabled={disabled || !canvasApi}
		aria-label="Italic"
		onclick={() => canvasApi?.toggleSelectedItalic()}
	>
		I
	</button>
{/if}

