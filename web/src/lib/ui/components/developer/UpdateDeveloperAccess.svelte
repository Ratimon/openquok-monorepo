<script lang="ts">
	import { getRootPathAccount, getRootPathPayloadWizard } from '$lib/area-protected/getRootPathProtectedArea';
	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Badge from '$lib/ui/badge/Badge.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CopyBlock from '$lib/ui/components/CopyBlock.svelte';

	type Props = {
		programmaticAccessToken: string | null;
		programmaticAccessConfigured: boolean;
		tokenVisible: boolean;
		canRotate: boolean;
		rotating: boolean;
		oauthAppReady: boolean;
		oauthAppLoading: boolean;
		onSetTokenVisible: (visible: boolean) => void;
		onRotateToken: () => void | Promise<void>;
		onGoToAppsTab: () => void;
	};

	let {
		programmaticAccessToken,
		programmaticAccessConfigured,
		tokenVisible,
		canRotate,
		rotating,
		oauthAppReady,
		oauthAppLoading,
		onSetTokenVisible,
		onRotateToken,
		onGoToAppsTab
	}: Props = $props();

	const canGenerateToken = $derived(canRotate && oauthAppReady && !oauthAppLoading);

	// /docs
	const rootPathPublicDocs = getRootPathPublicDocs();
	const publicDocsPath = route(rootPathPublicDocs);
	const publicApiDocsHref = url(`${publicDocsPath}/getting-started-for-public-api`);
	const cliAuthDocsHref = url(`${publicDocsPath}/getting-started-for-cli/authentication`);

	// /account/payload-wizard
	const rootPathAccount = getRootPathAccount();
	const rootPathPayloadWizard = getRootPathPayloadWizard();
	const payloadWizardPath = route(`${rootPathAccount}/${rootPathPayloadWizard}`);

	function maskedToken(token: string) {
		if (token.length <= 10) return '•'.repeat(Math.max(4, token.length));
		return `${'•'.repeat(Math.max(12, token.length - 6))}${token.slice(-6)}`;
	}

	const installCliCommand = 'npm install -g @openquok/node';
	const exportTokenCommand = $derived(
		programmaticAccessToken
			? `export OPENQUOK_API_KEY="${tokenVisible ? programmaticAccessToken : maskedToken(programmaticAccessToken)}"`
			: 'export OPENQUOK_API_KEY="opo_…"'
	);

	const rotateButtonLabel = $derived(
		rotating ? 'Working…' : programmaticAccessConfigured ? 'Rotate token' : 'Generate token'
	);

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
			<div class="flex flex-wrap items-center gap-2">
				<h3 class="text-base font-semibold">Programmatic access token</h3>
				{#if programmaticAccessConfigured && !programmaticAccessToken}
					<Badge variant="green">Configured</Badge>
				{/if}
			</div>
			<p class="text-sm text-base-content/70">
				Bearer token for <code class="text-xs">/public/*</code> and the CLI (<code class="text-xs">opo_…</code>).
			</p>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="ghost" href={publicApiDocsHref} target="_blank">Public API Docs</Button>
		</div>
	</div>

	{#if !oauthAppLoading && !oauthAppReady}
		<div class="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-base-content">
			<p class="font-medium">
				Create an OAuth application first
			</p>
			<p class="mt-1 text-base-content/70">
				Programmatic tokens are issued for your workspace OAuth app. Open the Apps tab to register one (name,
				redirect URL), then return here to generate a token.
			</p>
			<Button
				class="mt-3"
				variant="primary"
				onclick={() => onGoToAppsTab()}
			>
				Go to Oauth Apps
			</Button>
		</div>
	{/if}

	<div class="mt-4 rounded-lg border border-base-300 bg-base-100 p-4 font-mono text-sm">
		{#if programmaticAccessToken}
			{#if tokenVisible}
				{programmaticAccessToken}
			{:else}
				{maskedToken(programmaticAccessToken)}
			{/if}
		{:else if oauthAppReady}
			<span class="text-base-content/60">
				No token on screen — generate one below. Existing tokens stay hidden for security.
				<a class="link link-primary" href={cliAuthDocsHref} target="_blank" rel="noopener noreferrer">
					CLI authentication docs
				</a>
			</span>
		{:else if oauthAppLoading}
			<span class="text-base-content/60">Checking workspace OAuth app…</span>
		{:else}
			<span class="text-base-content/60">Create an OAuth app on the Apps tab, then generate a token here.</span>
		{/if}
	</div>

	<div class="mt-4 flex flex-wrap items-center gap-2">
		<Button
			class="gap-2"
			variant="ghost"
			disabled={!programmaticAccessToken}
			onclick={() => onSetTokenVisible(!tokenVisible)}
		>
			<AbstractIcon
				name={tokenVisible ? icons.Lock.name : icons.Eye.name}
				class="h-4 w-4 shrink-0"
				width="16"
				height="16"
			/>
			{tokenVisible ? 'Hide' : 'Reveal'}
		</Button>
		<Button
			class="gap-2"
			variant="primary"
			disabled={!programmaticAccessToken}
			onclick={() => programmaticAccessToken && copyToClipboard(programmaticAccessToken)}
		>
			<AbstractIcon name={icons.Copy.name} class="h-4 w-4 shrink-0" width="16" height="16" />
			Copy token
		</Button>
		<Button
			class="gap-2"
			variant="warning"
			disabled={!canGenerateToken || rotating}
			onclick={() => onRotateToken()}
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
			{rotateButtonLabel}
		</Button>
		<Button class="gap-2" variant="secondary" href={payloadWizardPath} target="_blank">
			<AbstractIcon name={icons.Sparkles.name} class="h-4 w-4 shrink-0" width="16" height="16" />
			Open Wizard
		</Button>
	</div>
</div>

<div class="rounded-xl border border-base-300 bg-base-200 p-6">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h3 class="text-base font-semibold">CLI &amp; AI Skills</h3>
			<p class="text-sm text-base-content/70">
				Install the CLI and set <code class="text-xs">OPENQUOK_API_KEY</code> to your programmatic token, or use
				device login.
			</p>
		</div>
		<Button variant="ghost" href={cliAuthDocsHref} target="_blank">Docs</Button>
	</div>

	<div class="mt-4 space-y-3">
		<div>
			<p class="text-sm font-medium text-base-content/80">1. Install the CLI</p>
			<CopyBlock
				text={installCliCommand}
				boxClass="mt-2 w-full cursor-pointer rounded-lg border p-4 font-mono text-sm text-left"
				background="border-base-300 bg-base-100"
				copiedBackground="border-success/50 bg-success/10"
				class="text-base-content break-all"
				copiedColor="text-success"
			/>
		</div>

		<div>
			<p class="text-sm font-medium text-base-content/80">2. Set your programmatic token</p>
			<CopyBlock
				text={exportTokenCommand}
				boxClass="mt-2 w-full cursor-pointer rounded-lg border p-4 font-mono text-sm text-left"
				background="border-base-300 bg-base-100"
				copiedBackground="border-success/50 bg-success/10"
				class="text-base-content break-all"
				copiedColor="text-success"
			/>
		</div>

		<div class="flex flex-wrap gap-2">
			<Button
				class="gap-2"
				variant="primary"
				disabled={!programmaticAccessToken}
				onclick={() =>
					programmaticAccessToken &&
					copyToClipboard(`export OPENQUOK_API_KEY="${programmaticAccessToken}"`)}
			>
				<AbstractIcon name={icons.Copy.name} class="h-4 w-4 shrink-0" width="16" height="16" />
				Copy export
			</Button>
		</div>
	</div>
</div>
