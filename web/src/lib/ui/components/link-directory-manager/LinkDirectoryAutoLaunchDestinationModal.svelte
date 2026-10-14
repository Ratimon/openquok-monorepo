<script lang="ts">
	import type { AutoLaunchExtensionConfig, LaunchStep } from 'openquok-common';

	import { autoLaunchRepository } from '$lib/auto-launch/index';
	import { normalizeHttpUrlInputIfLikely } from '$lib/utils/normalizeHttpUrlInput';
	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import ProviderHttpUrlInput from '$lib/ui/components/posts/providers/ProviderHttpUrlInput.svelte';
	import LinkDirectoryAutoLaunchExtensionStepsEditor from '$lib/ui/components/link-directory-manager/LinkDirectoryAutoLaunchExtensionStepsEditor.svelte';
	import { Input } from '$lib/ui/input';
	import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '$lib/ui/dialog';
	import { Textarea } from '$lib/ui/textarea';

	type Props = {
		opportunityId: string;
		opportunityTitle: string;
		providerSlug: string;
		providerLabel?: string;
		onSaved?: () => void | Promise<void>;
	};

	let { opportunityId, opportunityTitle, providerSlug, providerLabel, onSaved }: Props = $props();

	let dialogOpen = $state(false);
	let loading = $state(false);
	let submitting = $state(false);
	let destinationId = $state<string | null>(null);

	let name = $state('');
	let shortDescription = $state('');
	let startUrl = $state('');
	let isPublished = $state(false);
	let sortOrder = $state(0);
	let startUrlPatternsText = $state('');
	let readyUrlHint = $state('');
	let extensionSteps = $state<LaunchStep[]>([]);
	let pickerGroupKey = $state('');
	let pickerGroupTitle = $state('');
	let stepsEditorSession = $state(0);

	function parseUrlPatterns(text: string): string[] {
		return text
			.split(/[\n,]+/)
			.map((line) => line.trim())
			.filter(Boolean);
	}

	function patternsToText(patterns: string[] | undefined): string {
		return (patterns ?? []).join('\n');
	}

	function buildExtensionConfig(): AutoLaunchExtensionConfig {
		const patterns = parseUrlPatterns(startUrlPatternsText);
		return {
			version: 1,
			...(patterns.length > 0 ? { startUrlPatterns: patterns } : {}),
			...(readyUrlHint.trim() ? { readyUrlHint: readyUrlHint.trim() } : {}),
			...(extensionSteps.length > 0 ? { steps: extensionSteps } : {})
		};
	}

	async function loadDestination() {
		loading = true;
		try {
			const existing = await autoLaunchRepository.getAdminDestinationByProviderSlug(providerSlug);
			if (existing) {
				destinationId = existing.id;
				name = existing.name;
				shortDescription = existing.shortDescription ?? '';
				startUrl = existing.startUrl;
				isPublished = existing.isPublished;
				sortOrder = existing.sortOrder;
				startUrlPatternsText = patternsToText(existing.extensionConfig.startUrlPatterns);
				readyUrlHint = existing.extensionConfig.readyUrlHint ?? '';
				extensionSteps = existing.extensionConfig.steps ?? [];
				pickerGroupKey = existing.pickerGroupKey ?? '';
				pickerGroupTitle = existing.pickerGroupTitle ?? '';
			} else {
				destinationId = null;
				name = opportunityTitle;
				shortDescription = '';
				startUrl = '';
				isPublished = false;
				sortOrder = 0;
				startUrlPatternsText = '';
				readyUrlHint = '';
				extensionSteps = [];
				pickerGroupKey = '';
				pickerGroupTitle = '';
			}
			stepsEditorSession += 1;
		} finally {
			loading = false;
		}
	}

	async function openDialog() {
		await loadDestination();
		dialogOpen = true;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const normalizedStart = normalizeHttpUrlInputIfLikely(startUrl.trim());
		if (!normalizedStart) {
			toast.error('Enter a valid start URL for the extension handoff.');
			return;
		}
		if (!name.trim()) {
			toast.error('Destination name is required.');
			return;
		}
		submitting = true;
		try {
			const payload = {
				providerSlug,
				linkDirectoryOpportunityId: opportunityId,
				name: name.trim(),
				shortDescription: shortDescription.trim() || null,
				startUrl: normalizedStart,
				extensionConfig: buildExtensionConfig(),
				isPublished,
				sortOrder: Number.isFinite(Number(sortOrder)) ? Math.trunc(Number(sortOrder)) : 0,
				pickerGroupKey: pickerGroupKey.trim() || null,
				pickerGroupTitle: pickerGroupTitle.trim() || null
			};
			const result = destinationId
				? await autoLaunchRepository.updateAdminDestination(destinationId, payload)
				: await autoLaunchRepository.createAdminDestination(payload);
			if (!result.ok || !result.data) {
				toast.error(result.error ?? 'Failed to save auto-launch destination.');
				return;
			}
			destinationId = result.data.id;
			toast.success('Auto-fill configuration saved.');
			dialogOpen = false;
			await onSaved?.();
		} finally {
			submitting = false;
		}
	}
</script>

<Button variant="outline" size="sm" type="button" onclick={openDialog} disabled={!providerSlug}>
	Configure auto-fill
</Button>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
		<DialogHeader>
			<DialogTitle>Extension auto-fill</DialogTitle>
			<p class="text-sm text-base-content/70">
				{providerLabel ?? providerSlug} · linked to this opportunity
			</p>
		</DialogHeader>
		{#if loading}
			<p class="text-sm text-base-content/70">Loading destination…</p>
		{:else}
			<form class="space-y-4" onsubmit={handleSubmit}>
				<label class="form-control w-full">
					<span class="label-text text-sm">Destination name</span>
					<Input bind:value={name} required />
				</label>
				<label class="form-control w-full">
					<span class="label-text text-sm">Short description</span>
					<Textarea bind:value={shortDescription} rows={2} />
				</label>
				<label class="form-control w-full">
					<span class="label-text text-sm">Start URL (extension opens here)</span>
					<ProviderHttpUrlInput
						id="auto-launch-destination-start-url"
						bind:value={startUrl}
						placeholder="https://…"
						required
					/>
				</label>
				<div class="grid grid-cols-2 gap-3">
					<label class="form-control">
						<span class="label-text text-sm">Sort order</span>
						<Input type="number" bind:value={sortOrder} min={0} step={1} />
					</label>
					<label class="flex items-center gap-2 text-sm self-end pb-2">
						<input type="checkbox" class="checkbox checkbox-sm" bind:checked={isPublished} />
						Published in Add Channel
					</label>
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					<label class="form-control w-full">
						<span class="label-text text-sm">Picker group key (optional)</span>
						<Input
							bind:value={pickerGroupKey}
							class="font-mono text-sm"
							placeholder="uneed-product-listing"
						/>
						<span class="label-text-alt mt-1 block text-left leading-snug text-base-content/70">
							Same key on multiple destinations groups them in Add Channel (e.g. free vs paid paths).
						</span>
					</label>
					<label class="form-control w-full">
						<span class="label-text text-sm">Picker group title (optional)</span>
						<Input bind:value={pickerGroupTitle} placeholder="Product listing" />
					</label>
				</div>
				<label class="form-control w-full">
					<span class="label-text text-sm">Start URL patterns (one per line)</span>
					<Textarea
						bind:value={startUrlPatternsText}
						rows={3}
						class="font-mono text-xs"
						placeholder="https://example.com/*"
					/>
				</label>
				<label class="form-control w-full max-w-xs">
					<span class="label-text text-sm">Ready URL hint (optional)</span>
					<Input bind:value={readyUrlHint} class="font-mono text-sm" placeholder="pricing" />
				</label>

				{#if dialogOpen}
					{#key stepsEditorSession}
						<LinkDirectoryAutoLaunchExtensionStepsEditor
							initialSteps={extensionSteps}
							onChange={(next) => {
								extensionSteps = next;
							}}
						/>
					{/key}
				{/if}

				<DialogFooter>
					<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
					<Button type="submit" variant="primary" disabled={submitting}>Save configuration</Button>
				</DialogFooter>
			</form>
		{/if}
	</DialogContent>
</Dialog>
