<script lang="ts">
	import type { DirectorySeoCompetitorDto } from '$lib/directory-seo';
	import { directorySeoChartColorAt } from '$lib/directory-seo/directorySeoChartColors';
	import { formatDirectorySeoDr } from '$lib/directory-seo/formatDirectorySeoDisplay';

	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		competitor: DirectorySeoCompetitorDto;
		/** Chart legend color index (1 = first competitor line). */
		colorIndex: number;
		saving: boolean;
		onSaveLabel: (label: string | null) => void | Promise<void>;
		onRemove: () => void;
	};

	let { competitor, colorIndex, saving, onSaveLabel, onRemove }: Props = $props();

	let editing = $state(false);
	let draftLabel = $state('');

	const displayLabel = $derived(competitor.label?.trim() || competitor.domain);
	const chartColor = $derived(directorySeoChartColorAt(colorIndex));

	function startEdit() {
		draftLabel = competitor.label?.trim() ?? '';
		editing = true;
	}

	function cancelEdit() {
		editing = false;
		draftLabel = '';
	}

	async function commitEdit() {
		await onSaveLabel(draftLabel.trim() === '' ? null : draftLabel.trim());
		editing = false;
	}
</script>

<li
	class="flex flex-col gap-3 rounded-lg border border-base-300/80 bg-base-200/50 p-4 shadow-sm"
	aria-label={displayLabel}
>
	{#if editing}
		<div class="space-y-3">
			<div class="space-y-1">
				<p class="text-xs font-medium uppercase tracking-wide text-base-content/55">Domain</p>
				<p class="truncate text-sm text-base-content/80" title={competitor.domain}>{competitor.domain}</p>
			</div>
			<label class="flex flex-col gap-1.5">
				<span class="text-xs font-medium text-base-content/70">Display name</span>
				<input
					class="input input-bordered input-sm w-full"
					value={draftLabel}
					disabled={saving}
					placeholder={competitor.domain}
					aria-label="Competitor display name"
					oninput={(event) => (draftLabel = event.currentTarget.value)}
					onkeydown={(event) => {
						if (event.key === 'Enter') {
							event.preventDefault();
							void commitEdit();
						}
						if (event.key === 'Escape') {
							event.preventDefault();
							cancelEdit();
						}
					}}
				/>
				<span class="text-xs text-base-content/50">Shown on charts and compare pills. Leave empty to use the domain.</span>
			</label>
			<div class="flex flex-wrap justify-end gap-2 border-t border-base-300/60 pt-3">
				<Button type="button" variant="ghost" size="sm" disabled={saving} onclick={cancelEdit}>
					Cancel
				</Button>
				<Button type="button" variant="primary" size="sm" disabled={saving} onclick={() => void commitEdit()}>
					Save
				</Button>
			</div>
		</div>
	{:else}
		<div class="flex items-start gap-3">
			<span
				class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-base-100/80"
				style:background-color={chartColor}
				aria-hidden="true"
			></span>
			<div class="min-w-0 flex-1 space-y-0.5">
				<p class="truncate text-base font-semibold text-base-content" title={displayLabel}>
					{displayLabel}
				</p>
				<p class="truncate text-xs text-base-content/55" title={competitor.domain}>{competitor.domain}</p>
			</div>
			<div
				class="shrink-0 rounded-md border border-base-300/80 bg-base-100/70 px-2.5 py-1 text-center"
			>
				<p class="text-[10px] font-medium uppercase tracking-wide text-base-content/50">DR</p>
				<p class="text-lg font-semibold tabular-nums leading-tight">
					{formatDirectorySeoDr(competitor.domainRating)}
				</p>
			</div>
		</div>
		<div class="flex gap-2 border-t border-base-300/60 pt-3">
			<Button
				type="button"
				variant="outline"
				size="sm"
				class="min-h-8 flex-1"
				disabled={saving}
				onclick={startEdit}
			>
				Edit
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				class="min-h-8 flex-1"
				disabled={saving}
				onclick={onRemove}
			>
				Remove
			</Button>
		</div>
	{/if}
</li>
