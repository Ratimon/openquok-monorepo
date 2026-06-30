<script lang="ts">
	import { nanoid } from 'nanoid';

	import type { StackBuilderReferenceAsset } from '$lib/stack-builder/stackBuilder.types';
	import { CHARACTER_BRIEF_TEMPLATE_JSON } from '$lib/stack-builder/constants/defaults';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		assets: StackBuilderReferenceAsset[];
		onChange: (assets: StackBuilderReferenceAsset[]) => void;
	};

	let { assets, onChange }: Props = $props();

	let dragOver = $state(false);

	function updateAsset(assetId: string, patch: Partial<StackBuilderReferenceAsset>) {
		onChange(assets.map((asset) => (asset.id === assetId ? { ...asset, ...patch } : asset)));
	}

	function removeAsset(assetId: string) {
		onChange(assets.filter((asset) => asset.id !== assetId));
	}

	function addJsonAsset() {
		onChange([
			...assets,
			{
				id: nanoid(),
				type: 'json',
				label: 'JSON reference',
				payload: CHARACTER_BRIEF_TEMPLATE_JSON
			}
		]);
	}

	function readFileAsDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result ?? ''));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}

	async function handleFiles(fileList: FileList | null) {
		if (!fileList?.length) return;
		const nextAssets = [...assets];

		for (const file of Array.from(fileList)) {
			if (file.type.startsWith('image/')) {
				const dataUrl = await readFileAsDataUrl(file);
				nextAssets.push({
					id: nanoid(),
					type: 'image',
					label: file.name,
					dataUrl
				});
			} else if (file.type === 'application/json' || file.name.endsWith('.json')) {
				const text = await file.text();
				nextAssets.push({
					id: nanoid(),
					type: 'json',
					label: file.name.replace(/\.json$/i, '') || 'JSON reference',
					payload: text
				});
			}
		}

		onChange(nextAssets);
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		void handleFiles(event.dataTransfer?.files ?? null);
	}
</script>

<section class="rounded-2xl border border-base-content/10 bg-base-100">
	<header class="flex flex-wrap items-center justify-between gap-2 border-b border-base-content/10 px-4 py-3">
		<div>
			<h2 class="text-sm font-semibold text-base-content">Reference assets</h2>
			<p class="mt-1 text-xs text-base-content/60">
				Drop images or JSON files. Assets are included in the exported markdown.
			</p>
		</div>
		<button type="button" class="btn btn-outline btn-sm" onclick={addJsonAsset}>Add JSON template</button>
	</header>

	<div
		role="region"
		aria-label="Drop reference assets"
		class="m-4 rounded-xl border border-dashed p-6 text-center transition {dragOver
			? 'border-primary bg-primary/5'
			: 'border-base-content/20'}"
		ondragover={(event) => {
			event.preventDefault();
			dragOver = true;
		}}
		ondragleave={() => {
			dragOver = false;
		}}
		ondrop={onDrop}
	>
		<p class="text-sm text-base-content/70">Drag and drop images or JSON files here</p>
		<label class="btn btn-ghost btn-sm mt-3">
			Browse files
			<input
				type="file"
				class="hidden"
				accept="image/*,.json,application/json"
				multiple
				onchange={(event) => void handleFiles(event.currentTarget.files)}
			/>
		</label>
	</div>

	{#if assets.length > 0}
		<ul class="space-y-3 px-4 pb-4">
			{#each assets as asset (asset.id)}
				<li class="rounded-xl border border-base-content/10 p-4">
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0 flex-1 space-y-3">
							<label class="block space-y-1">
								<span class="text-xs font-medium text-base-content/70">Label</span>
								<input
									class="input input-bordered w-full text-sm"
									value={asset.label}
									oninput={(event) =>
										updateAsset(asset.id, { label: event.currentTarget.value })}
								/>
							</label>

							<p class="text-xs uppercase text-base-content/50">{asset.type}</p>

							{#if asset.type === 'image' && asset.dataUrl}
								<img
									src={asset.dataUrl}
									alt={asset.label}
									class="max-h-40 rounded-lg border border-base-content/10 object-contain"
								/>
							{:else if asset.type === 'json'}
								<textarea
									class="textarea textarea-bordered w-full font-mono text-xs"
									rows="8"
									value={asset.payload ?? ''}
									oninput={(event) =>
										updateAsset(asset.id, { payload: event.currentTarget.value })}
								></textarea>
							{/if}
						</div>

						<button
							type="button"
							class="btn btn-ghost btn-xs btn-square shrink-0"
							aria-label="Remove asset"
							onclick={() => removeAsset(asset.id)}
						>
							<AbstractIcon name={icons.X2.name} width="14" height="14" aria-hidden="true" />
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
