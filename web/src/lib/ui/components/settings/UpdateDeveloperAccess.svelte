<script lang="ts">
	import type { DevelopersSettingsPresenter } from '$lib/settings/DevelopersSettings.presenter.svelte';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { toast } from '$lib/ui/sonner';

	type Props = {
		presenter: DevelopersSettingsPresenter;
		apiKey: string | null;
		apiKeyVisible: boolean;
		canRotate: boolean;
		rotating: boolean;
	};

	let { presenter, apiKey, apiKeyVisible, canRotate, rotating }: Props = $props();

	function maskedKey(key: string) {
		if (key.length <= 10) return '•'.repeat(Math.max(4, key.length));
		return `${'•'.repeat(Math.max(12, key.length - 6))}${key.slice(-6)}`;
	}

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Copied to clipboard');
		} catch {
			toast.error('Failed to copy');
		}
	}
</script>

<div class="rounded-xl border border-base-300 bg-base-200 p-6">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h3 class="text-base font-semibold">API Key</h3>
			<p class="text-sm text-base-content/70">Use Openquok API to integrate with your tools.</p>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="outline" onclick={() => toast.message('Docs link coming soon')}>Docs</Button>
		</div>
	</div>

	<div class="mt-4 rounded-lg border border-base-300 bg-base-100 p-4 font-mono text-sm">
		{#if apiKey}
			{#if apiKeyVisible}
				{apiKey}
			{:else}
				{maskedKey(apiKey)}
			{/if}
		{:else}
			<span class="text-base-content/60">No API key found for this workspace.</span>
		{/if}
	</div>

	<div class="mt-4 flex flex-wrap items-center gap-2">
		<Button variant="outline" disabled={!apiKey} onclick={() => presenter.setApiKeyVisible(!apiKeyVisible)}>
			{apiKeyVisible ? 'Hide' : 'Reveal'}
		</Button>
		<Button variant="outline" disabled={!apiKey} onclick={() => apiKey && copyToClipboard(apiKey)}>Copy</Button>
		<Button
			variant="outline"
			disabled={!apiKey || !canRotate || rotating}
			onclick={() => presenter.rotateApiKey()}
		>
			{rotating ? 'Rotating…' : 'Rotate Key'}
		</Button>
		<Button variant="outline" onclick={() => toast.message('Wizard coming soon')}>Open Wizard</Button>
	</div>
</div>

<div class="rounded-xl border border-base-300 bg-base-200 p-6">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h3 class="text-base font-semibold">CLI &amp; AI Skills</h3>
			<p class="text-sm text-base-content/70">
				Install the CLI and configure your environment variable for programmatic access.
			</p>
		</div>
		<Button variant="outline" onclick={() => toast.message('Docs link coming soon')}>Docs</Button>
	</div>

	<div class="mt-4 space-y-3">
		<div>
			<p class="text-sm font-medium text-base-content/80">1. Install the CLI</p>
			<div class="mt-2 rounded-lg border border-base-300 bg-base-100 p-4 font-mono text-sm">
				npm install -g openquok
			</div>
		</div>

		<div>
			<p class="text-sm font-medium text-base-content/80">2. Set your API key</p>
			<div class="mt-2 rounded-lg border border-base-300 bg-base-100 p-4 font-mono text-sm">
				{#if apiKey}
					export OPENQUOK_API_KEY="{apiKeyVisible ? apiKey : maskedKey(apiKey)}"
				{:else}
					export OPENQUOK_API_KEY="..."
				{/if}
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			<Button
				variant="outline"
				disabled={!apiKey}
				onclick={() => apiKey && copyToClipboard(`export OPENQUOK_API_KEY=\"${apiKey}\"`)}
			>
				Copy Export
			</Button>
		</div>
	</div>
</div>
