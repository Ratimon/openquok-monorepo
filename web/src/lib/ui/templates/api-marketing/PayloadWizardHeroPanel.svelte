<script lang="ts">
	import type { PublicApiFormatExample } from '$lib/content/constants/apis/types';
	import type { CreateSocialPostMode } from '$lib/posts/createSocialPost.types';
	import type { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPost.presenter.svelte';

	import { onDestroy, untrack } from 'svelte';

	import { PUBLIC_API_CREATE_POST_ENDPOINT } from '$lib/content/constants/apis/shared';
	import { PublicPayloadWizardComposerPresenter } from '$lib/posts/PublicPayloadWizardComposer.presenter.svelte';
	import { toast } from '$lib/ui/sonner';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import PayloadWizardComposerPanel from '$lib/ui/templates/api-marketing/PayloadWizardComposerPanel.svelte';

	type PayloadPreviewTab = 'live' | string;

	type Props = {
		mode?: 'guest' | 'workspace';
		isLoggedIn?: boolean;
		focusedProviderIdentifier?: string | null;
		composerMode?: CreateSocialPostMode;
		formatExamples?: readonly PublicApiFormatExample[];
		sectionTitle?: string;
		sectionDescription?: string;
		workspaceComposer?: CreateSocialPostPresenter;
		workspaceId?: string | null;
	};

	let {
		mode = 'guest',
		isLoggedIn = false,
		focusedProviderIdentifier = null,
		composerMode = 'global',
		formatExamples = [],
		sectionTitle = 'Try the Payload Wizard',
		sectionDescription = 'Compose with sample channels, then copy JSON for POST /api/v1/public/posts. Scheduling and uploads need a workspace — copy JSON stays free.',
		workspaceComposer,
		workspaceId = null
	}: Props = $props();

	let guestComposer = $state.raw<PublicPayloadWizardComposerPresenter | undefined>(undefined);

	$effect(() => {
		if (mode !== 'guest') {
			guestComposer?.teardown();
			guestComposer = undefined;
			return;
		}
		guestComposer ??= new PublicPayloadWizardComposerPresenter({
			focusedProviderIdentifier: untrack(() => focusedProviderIdentifier),
			composerMode: untrack(() => composerMode)
		});
	});

	let selectedPreviewTab = $state<PayloadPreviewTab>('live');

	const hasFormatTabs = $derived(formatExamples.length > 0);

	const livePayloadResult = $derived.by(() => {
		if (mode === 'workspace' && workspaceComposer) {
			return workspaceComposer.getProgrammaticCreatePostPayloadPreview('scheduled');
		}
		return guestComposer?.wizardPayloadResult ?? { ok: false as const, error: '' };
	});

	const livePayload = $derived.by(() => {
		const result = livePayloadResult;
		if (result.ok) return result.payload;
		return null;
	});

	const activeFormatExample = $derived.by(() => {
		if (selectedPreviewTab === 'live') return null;
		return formatExamples.find((example) => example.id === selectedPreviewTab) ?? null;
	});

	const previewJsonText = $derived.by(() => {
		if (activeFormatExample) {
			return activeFormatExample.requestJson;
		}
		if (livePayload) {
			return JSON.stringify(livePayload, null, 2);
		}
		return livePayloadResult.ok ? '' : livePayloadResult.error;
	});

	const previewJsonReady = $derived(
		selectedPreviewTab === 'live' ? Boolean(livePayload) : Boolean(activeFormatExample)
	);

	async function copyLivePayload(): Promise<void> {
		if (mode === 'workspace' && workspaceComposer) {
			const res = workspaceComposer.getProgrammaticCreatePostPayloadPreview('scheduled');
			if (!res.ok) {
				toast.error(res.error);
				return;
			}
			try {
				await navigator.clipboard.writeText(JSON.stringify(res.payload, null, 2));
				toast.success('Scheduled payload copied.');
			} catch {
				toast.error('Could not copy to clipboard.');
			}
			return;
		}
		if (guestComposer) {
			await guestComposer.copyProgrammaticPayload('scheduled');
		}
	}

	$effect(() => {
		guestComposer?.applyPageChannel({
			focusedProviderIdentifier,
			composerMode
		});
	});

	onDestroy(() => {
		guestComposer?.teardown();
	});
</script>

{#if mode === 'workspace'}
	<div class="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] xl:items-stretch">
		<PayloadWizardComposerPanel
			mode="workspace"
			{workspaceComposer}
			{workspaceId}
			{isLoggedIn}
			guestMode={false}
		/>

		{@render payloadPreviewColumn()}
	</div>
{:else}
	<section class="py-10 md:py-14">
		<div class="container mx-auto space-y-6 px-4">
			<div class="mx-auto max-w-3xl space-y-2 text-center">
				<h2 class="text-2xl font-black tracking-tight text-base-content sm:text-3xl">
					{sectionTitle}
				</h2>
				<p class="text-base font-medium leading-relaxed text-base-content/70">
					{sectionDescription}
				</p>
			</div>

			<div class="mx-auto grid w-full max-w-[min(100vw-2rem,1400px)] min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] xl:items-stretch">
				<PayloadWizardComposerPanel mode="guest" guestComposer={guestComposer} {isLoggedIn} guestMode={true} />

				{@render payloadPreviewColumn()}
			</div>
		</div>
	</section>
{/if}

{#snippet payloadPreviewColumn()}
	<div class="flex min-h-0 min-w-0 flex-col gap-4 xl:min-h-[min(72vh,820px)]">
		<div class="flex min-h-0 flex-1 flex-col space-y-3 rounded-lg border border-base-300 bg-base-100 p-4">
			<div class="flex shrink-0 flex-wrap items-center justify-between gap-3">
				<h3 class="text-base font-semibold text-base-content">Generated payload</h3>
				<Button
					variant="primary"
					type="button"
					class="gap-2"
					disabled={!previewJsonReady || selectedPreviewTab !== 'live'}
					onclick={() => void copyLivePayload()}
				>
					<AbstractIcon name={icons.Copy.name} class="size-4" width="16" height="16" />
					Copy JSON
				</Button>
			</div>

			{#if hasFormatTabs}
				<div class="flex shrink-0 flex-wrap gap-2" role="tablist" aria-label="Payload preview format">
					<button
						type="button"
						role="tab"
						class="rounded-full border px-3 py-1 text-xs font-semibold transition-colors {selectedPreviewTab === 'live'
							? 'border-primary bg-primary/10 text-primary'
							: 'border-base-300 text-base-content/70 hover:border-base-content/30'}"
						aria-selected={selectedPreviewTab === 'live'}
						onclick={() => {
							selectedPreviewTab = 'live';
						}}
					>
						Live payload
					</button>
					{#each formatExamples as example (example.id)}
						<button
							type="button"
							role="tab"
							class="rounded-full border px-3 py-1 text-xs font-semibold transition-colors {selectedPreviewTab === example.id
								? 'border-primary bg-primary/10 text-primary'
								: 'border-base-300 text-base-content/70 hover:border-base-content/30'}"
							aria-selected={selectedPreviewTab === example.id}
							onclick={() => {
								selectedPreviewTab = example.id;
							}}
						>
							{example.label}
						</button>
					{/each}
				</div>
			{/if}

			{#if previewJsonReady}
				<pre
					class="min-h-0 flex-1 overflow-auto rounded-md border border-base-300 bg-base-200/40 p-4 text-xs text-base-content"
				><code>{previewJsonText}</code></pre>
			{:else}
				<div class="min-h-0 flex-1 rounded-md border border-base-300 bg-base-200/40 p-4">
					<p class="text-sm text-base-content/70">
						{previewJsonText || 'Fill out the composer to generate a payload.'}
					</p>
				</div>
			{/if}
		</div>

		<div class="shrink-0 space-y-2 rounded-lg border border-base-300 bg-base-100 p-4">
			<h3 class="text-base font-semibold text-base-content">Endpoint</h3>
			<p class="text-sm text-base-content/70">
				Send this payload to <span class="font-mono text-base-content">{PUBLIC_API_CREATE_POST_ENDPOINT}</span>.
			</p>
			<p class="text-sm text-base-content/70">
				<span class="font-medium text-base-content">Note:</span> programmatic auth derives the organization from your OAuth app
				token, so <span class="font-mono text-base-content">organizationId</span> is intentionally omitted.
			</p>
			{#if mode === 'guest'}
				<p class="text-sm text-base-content/70">
					<span class="font-medium text-base-content">Sample ids:</span> channel UUIDs in the live preview are illustrative.
					List connected channels with <span class="font-mono text-base-content">GET /api/v1/public/integrations</span> and copy real
					<span class="font-mono text-base-content">integrationIds</span> into your payload.
				</p>
			{/if}
		</div>
	</div>
{/snippet}
