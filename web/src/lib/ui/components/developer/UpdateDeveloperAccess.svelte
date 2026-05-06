<script lang="ts">
	import { getRootPathAccount, getRootPathPayloadWizard } from '$lib/area-protected/getRootPathProtectedArea';
	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import { route } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		apiKey: string | null;
		apiKeyVisible: boolean;
		canRotate: boolean;
		rotating: boolean;
		onSetApiKeyVisible: (visible: boolean) => void;
		onRotateApiKey: () => void | Promise<void>;
	};

	let { apiKey, apiKeyVisible, canRotate, rotating, onSetApiKeyVisible, onRotateApiKey }: Props = $props();

	// /docs
	const rootPathPublicDocs = getRootPathPublicDocs();
	const publicDocsPath = route(rootPathPublicDocs);

	// /account/payload-wizard
	const rootPathAccount = getRootPathAccount();
	const rootPathPayloadWizard = getRootPathPayloadWizard();
	const payloadWizardPath = route(`${rootPathAccount}/${rootPathPayloadWizard}`);

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
			<h3 class="text-base font-semibold">
                API Key
            </h3>
			<p class="text-sm text-base-content/70">
                Use Openquok API to integrate with your tools.
            </p>
		</div>

		<div class="flex items-center gap-2">
			<Button
                variant="ghost"
                href={publicDocsPath}
                target="_blank"
            >
                Public API Docs
            </Button>
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
			<span class="text-base-content/60">
                No API key found for this workspace.
            </span>
		{/if}
	</div>

	<div class="mt-4 flex flex-wrap items-center gap-2">
		<Button
			class="gap-2"
			variant="ghost"
			disabled={!apiKey}
			onclick={() => onSetApiKeyVisible(!apiKeyVisible)}
		>
			<AbstractIcon
				name={apiKeyVisible ? icons.Lock.name : icons.Eye.name}
				class="h-4 w-4 shrink-0"
				width="16"
				height="16"
			/>
			{apiKeyVisible ? 'Hide' : 'Reveal'}
		</Button>
		<Button
			class="gap-2"
			variant="primary"
			disabled={!apiKey}
			onclick={() => apiKey && copyToClipboard(apiKey)}
		>
			<AbstractIcon name={icons.Copy.name} class="h-4 w-4 shrink-0" width="16" height="16" />
			Copy
		</Button>
		<Button
			class="gap-2"
			variant="warning"
			disabled={!apiKey || !canRotate || rotating}
			onclick={() => onRotateApiKey()}
		>
			{#if rotating}
				<AbstractIcon
					name={icons.LoaderCircle.name}
					class="h-4 w-4 shrink-0 animate-spin"
					width="16"
					height="16"
				/>
			{:else}
				<AbstractIcon name={icons.RefreshCw.name} class="h-4 w-4 shrink-0" width="16" height="16" />
			{/if}
			{rotating ? 'Rotating…' : 'Rotate Key'}
		</Button>
		<Button
            class="gap-2"
            variant="secondary"
			href={payloadWizardPath}
            target="_blank"
        >
			<AbstractIcon name={icons.Sparkles.name} class="h-4 w-4 shrink-0" width="16" height="16" />
			Open Wizard
		</Button>
	</div>
</div>

<div class="rounded-xl border border-base-300 bg-base-200 p-6">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h3 class="text-base font-semibold">
                CLI &amp; AI Skills
            </h3>
			<p class="text-sm text-base-content/70">
				Install the CLI and configure your environment variable for programmatic access.
			</p>
		</div>
		<Button
            variant="ghost"
            onclick={() => toast.message('Docs link coming soon')}
        >
            Docs
        </Button>
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
