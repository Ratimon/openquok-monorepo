<script lang="ts">
	import type { IApi } from '@svar-ui/svelte-filemanager';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	export type MediaLibraryLayout = 'table' | 'cards' | 'panels' | 'gallery';

	type FileManagerViewMode = 'table' | 'cards' | 'panels' | 'search';

	interface MediaFileManagerViewControlsProps {
		layout: MediaLibraryLayout;
		onLayoutChange: (layout: MediaLibraryLayout) => void;
		api?: IApi | null;
	}

	let { layout, onLayoutChange, api = null }: MediaFileManagerViewControlsProps = $props();

	let previewOpen = $state(true);

	const modeButtons = [
		{ id: 'table' as const, icon: icons.ListAlignJustify.name, label: 'List view' },
		{ id: 'cards' as const, icon: icons.Grid2x2.name, label: 'Grid view' },
		{ id: 'panels' as const, icon: icons.Columns2.name, label: 'Panels view' },
		{ id: 'gallery' as const, icon: icons.Grid3x3.name, label: 'Gallery view' }
	];

	const iconBtn =
		'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-base-300/80 bg-base-200/45 text-base-content/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-base-300/55 hover:text-base-content focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';

	const modeBtn =
		'inline-flex h-8 w-9 shrink-0 items-center justify-center rounded-md text-base-content/70 transition-colors hover:bg-base-300/50 hover:text-base-content focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none';

	const modeBtnActive = 'bg-primary text-primary-content shadow-sm hover:bg-primary hover:text-primary-content';

	const showPreviewToggle = $derived(layout !== 'gallery' && api != null);

	function syncFromApi(): void {
		if (!api || layout === 'gallery') return;
		const state = api.getState();
		const mode = state.mode;
		if (
			(mode === 'table' || mode === 'cards' || mode === 'panels') &&
			mode !== layout
		) {
			onLayoutChange(mode);
		}
		previewOpen = Boolean(state.preview);
	}

	function togglePreview(): void {
		if (!api) return;
		void api.exec('show-preview', { mode: !previewOpen });
	}

	function setLayout(mode: MediaLibraryLayout): void {
		if (layout === mode) return;
		onLayoutChange(mode);
		if (mode !== 'gallery' && api) {
			void api.exec('set-mode', { mode });
		}
	}

	$effect(() => {
		if (!api || layout === 'gallery') return;

		syncFromApi();

		api.on('set-mode', (ev: { mode?: FileManagerViewMode }) => {
			const mode = ev?.mode;
			if (
				(mode === 'table' || mode === 'cards' || mode === 'panels') &&
				mode !== layout
			) {
				onLayoutChange(mode);
			}
		});

		api.on('show-preview', (ev: { mode?: boolean }) => {
			if (typeof ev?.mode === 'boolean') previewOpen = ev.mode;
		});
	});
</script>

<div class="flex items-center gap-2" role="toolbar" aria-label="Display options">
	{#if showPreviewToggle}
		<button
			type="button"
			class="{iconBtn} {previewOpen ? 'border-primary/50 bg-primary/15 text-primary' : ''}"
			aria-pressed={previewOpen}
			aria-label={previewOpen ? 'Hide preview panel' : 'Show preview panel'}
			title={previewOpen ? 'Hide preview' : 'Show preview'}
			onclick={togglePreview}
		>
			<AbstractIcon name={icons.Eye.name} class="size-5" width="20" height="20" />
		</button>
	{/if}

	<div
		class="border-base-300/80 bg-base-200/45 flex rounded-lg border p-0.5 shadow-sm backdrop-blur-sm"
		role="group"
		aria-label="View mode"
	>
		{#each modeButtons as mode (mode.id)}
			<button
				type="button"
				class="{modeBtn} {layout === mode.id ? modeBtnActive : ''}"
				aria-pressed={layout === mode.id}
				aria-label={mode.label}
				title={mode.label}
				onclick={() => setLayout(mode.id)}
			>
				<AbstractIcon name={mode.icon} class="size-[18px]" width="18" height="18" />
			</button>
		{/each}
	</div>
</div>
