<script lang="ts">
	import type { AspectRatioPreset } from '$lib/ui/canvas-editor/utils/aspectRatioPresets';
	import {
		ASPECT_RATIO_PLATFORM_GROUPS,
		aspectPresetDisplayLine,
		getAspectPresetById
	} from '$lib/ui/canvas-editor/utils/aspectRatioPresets';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { ShiftingTabDropdown } from '$lib/ui/dropdown-shifting';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		disabled?: boolean;
		aspectRatioId: string;
		selectedAspect: AspectRatioPreset;
		onAspectChange?: (id: string) => void;
		/**
		 * `canvasHeader` — large “Resize” control in the left resource column; wide, left-aligned panel.
		 * `toolbar` — compact control (e.g. icon nav when the resource column is collapsed).
		 */
		layout?: 'canvasHeader' | 'toolbar';
	};

	let {
		disabled = false,
		aspectRatioId,
		selectedAspect,
		onAspectChange,
		layout = 'canvasHeader'
	}: Props = $props();

	let open = $state(false);
	let selectedPlatformId = $state('general');

	const tabs = $derived(
		ASPECT_RATIO_PLATFORM_GROUPS.map((g) => ({ id: g.id, label: g.title }))
	);

	function groupIdForPreset(presetId: string): string {
		for (const g of ASPECT_RATIO_PLATFORM_GROUPS) {
			if (g.presetIds.includes(presetId)) return g.id;
		}
		return 'general';
	}

	// When the dropdown is closed, keep the tab row aligned with the committed aspect ratio.
	// While open, the user can browse other platform tabs without this overwriting their selection.
	$effect(() => {
		open;
		aspectRatioId;
		if (!open) {
			selectedPlatformId = groupIdForPreset(aspectRatioId);
		}
	});

	function presetsForPlatform(platformId: string) {
		const g = ASPECT_RATIO_PLATFORM_GROUPS.find((x) => x.id === platformId);
		if (!g) return [];
		return g.presetIds.map((id) => getAspectPresetById(id));
	}

	function pick(id: string) {
		onAspectChange?.(id);
		open = false;
	}

	const summaryLine = $derived(
		`${selectedAspect.exportWidth}×${selectedAspect.exportHeight} · ${selectedAspect.menuTitle ?? selectedAspect.label}`
	);
</script>

<ShiftingTabDropdown
	bind:open
	bind:selectedTabId={selectedPlatformId}
	{tabs}
	panelAlign={layout === 'canvasHeader' ? 'start' : 'end'}
	rootClass={layout === 'canvasHeader' ? 'w-full' : ''}
	panelClass={layout === 'canvasHeader'
		? '!min-w-[min(100vw-1.5rem,36rem)] !max-w-[min(100vw-1.5rem,44rem)] !p-4'
		: '!max-w-[min(100vw-1rem,32rem)] !min-w-[min(100vw-1rem,22rem)]'}
>
	{#snippet trigger({ toggle, expanded })}
		{#if layout === 'canvasHeader'}
			<button
				type="button"
				disabled={disabled}
				class="bg-secondary text-secondary-content hover:bg-secondary/80 focus-visible:ring-secondary/40 flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
				aria-expanded={expanded}
				aria-haspopup="dialog"
				onclick={toggle}
			>
				<AbstractIcon name={icons.LayoutTemplate.name} class="size-4 shrink-0 opacity-90" width="16" height="16" />
				<span class="text-sm font-medium tracking-tight">Resize</span>
				<span class="text-secondary-content/80 min-w-0 flex-1 truncate text-xs leading-tight">
					{summaryLine}
				</span>
				<AbstractIcon
					name={icons.ChevronDown.name}
					class={cn('size-4 shrink-0 opacity-80 transition-transform', expanded && 'rotate-180')}
					width="16"
					height="16"
				/>
			</button>
		{:else}
			<Button
				type="button"
				variant="secondary"
				size="sm"
				class="max-w-[11rem] gap-1.5 sm:max-w-[20rem]"
				disabled={disabled}
				aria-expanded={expanded}
				aria-haspopup="dialog"
				onclick={toggle}
			>
				<AbstractIcon name={icons.LayoutTemplate.name} class="size-3.5 shrink-0 opacity-90 sm:size-4" width="16" height="16" />
				<span class="truncate text-left text-xs sm:text-sm">{aspectPresetDisplayLine(selectedAspect)}</span>
				<AbstractIcon
					name={icons.ChevronDown.name}
					class={cn('size-3.5 shrink-0 opacity-90 transition-transform sm:size-4', expanded && 'rotate-180')}
					width="16"
					height="16"
				/>
			</Button>
		{/if}
	{/snippet}

	{#snippet children()}
		<p class="text-base-content/70 mb-2 text-xs font-medium sm:text-sm">Choose a platform, then a format</p>
		<div
			class="grid max-h-[min(65vh,26rem)] grid-cols-1 gap-2.5 overflow-y-auto pr-0.5 sm:grid-cols-2 lg:grid-cols-3"
		>
			{#each presetsForPlatform(selectedPlatformId) as preset (preset.id)}
				<button
					type="button"
					class={cn(
						'border-base-300 bg-base-100/80 hover:border-primary/50 flex min-h-[7.5rem] flex-col gap-2 rounded-xl border p-3 text-left transition-colors',
						aspectRatioId === preset.id && 'border-primary ring-primary/25 ring-2'
					)}
					onclick={() => pick(preset.id)}
				>
					<div
						class="mx-auto w-full max-w-[5rem] rounded-md border border-secondary/45 bg-gradient-to-br from-secondary/35 to-primary/15 shadow-sm ring-1 ring-secondary/25"
						style:aspect-ratio="{preset.ratioW} / {preset.ratioH}"
						aria-hidden="true"
					></div>
					<div class="min-w-0 flex-1">
						<p class="text-base-content text-xs leading-snug font-semibold sm:text-sm">
							{aspectPresetDisplayLine(preset)}
						</p>
						{#if preset.hint}
							<p class="text-base-content/55 mt-1 line-clamp-2 text-[10px] leading-snug sm:text-xs">
								{preset.hint}
							</p>
						{/if}
					</div>
					{#if aspectRatioId === preset.id}
						<div class="text-primary flex items-center gap-1 text-[10px] font-medium sm:text-xs">
							<AbstractIcon name={icons.Check.name} class="size-3.5 shrink-0" width="14" height="14" />
							Selected
						</div>
					{/if}
				</button>
			{/each}
		</div>
	{/snippet}
</ShiftingTabDropdown>
