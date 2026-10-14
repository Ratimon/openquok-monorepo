<script lang="ts">
	import type { BrowserExtensionSessionCookie } from 'openquok-common';

	import { preflightBrowserExtensionConnect } from '$lib/integrations/browser-extension/extensionConnectFlow';
	import { preflightDirectoryLaunchExtension } from '$lib/auto-launch/browser-extension/preflightDirectoryLaunchExtension';
	import { openDirectoryLaunchStartUrl } from '$lib/auto-launch/utils/openDirectoryLaunchStartUrl';
	import { icons } from '$data/icons';

	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ChannelConnectLegalFooter from '$lib/ui/components/legal/ChannelConnectLegalFooter.svelte';

	type ConnectPurpose = 'channel' | 'directory-launch';

	type Props = {
		open?: boolean;
		providerName: string;
		providerIdentifier: string;
		submitting?: boolean;
		/** Channel connect reads cookies; directory launch only checks extension presence. */
		connectPurpose?: ConnectPurpose;
		/** When set, opens this URL in a new tab before handoff (same user gesture as Continue). */
		directoryLaunchStartUrl?: string | null;
		onSubmit: (
			cookies: BrowserExtensionSessionCookie[],
			context?: { openedDirectoryTabInNewTab?: boolean }
		) => void | Promise<void>;
		onCancel?: () => void;
	};

	let {
		open = $bindable(false),
		providerName,
		providerIdentifier,
		submitting = false,
		connectPurpose = 'channel',
		directoryLaunchStartUrl = null,
		onSubmit,
		onCancel
	}: Props = $props();

	const isDirectoryLaunch = $derived(connectPurpose === 'directory-launch');

	let connecting = $state(false);
	let errorMessage = $state<string | null>(null);

	const busy = $derived(submitting || connecting);

	function handleCancel() {
		if (busy) return;
		open = false;
		onCancel?.();
	}

	async function handleConnect() {
		if (busy) return;
		if (!isDirectoryLaunch && !providerIdentifier) return;
		errorMessage = null;
		connecting = true;
		let openedDirectoryTab = false;
		try {
			if (isDirectoryLaunch) {
				const startUrl = directoryLaunchStartUrl?.trim();
				if (startUrl) {
					openDirectoryLaunchStartUrl(startUrl);
					openedDirectoryTab = true;
				}
				const preflight = await preflightDirectoryLaunchExtension();
				if (!preflight.ok) {
					errorMessage = preflight.error;
					return;
				}
				await onSubmit([], { openedDirectoryTabInNewTab: openedDirectoryTab });
				return;
			}
			const preflight = await preflightBrowserExtensionConnect(providerIdentifier);
			if (!preflight.ok) {
				errorMessage = preflight.error;
				return;
			}
			await onSubmit(preflight.cookies);
		} finally {
			connecting = false;
		}
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(next) => {
		if (!next && busy) {
			open = true;
			return;
		}
		if (!next) {
			errorMessage = null;
			onCancel?.();
		}
	}}
>
	<Dialog.Content class="max-w-lg gap-4" showCloseButton={!busy}>
		<Dialog.Header>
			<Dialog.Title>
				{isDirectoryLaunch ? 'OpenQuok extension required' : `Connect ${providerName}`}
			</Dialog.Title>
			<Dialog.Description class="text-base-content/70 text-sm leading-relaxed">
				{#if isDirectoryLaunch}
					Directory launch uses the OpenQuok browser extension to open the submission page and fill
					fields from your product profile. You submit the listing yourself on the directory site.
				{:else}
					This channel uses the OpenQuok browser extension. When you continue,
					the extension reads session cookies from the platform site in this browser profile only after
					you confirm. You must stay logged in on that site. Platform terms may restrict automated
					access — you are responsible for compliance.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<ul class="list-disc space-y-2 pl-5 text-sm text-base-content/80">
			<li>Install and enable the OpenQuok extension in Chrome (same profile as this tab).</li>
			{#if isDirectoryLaunch}
				<li>Pin the extension, then continue to hand off your launch session.</li>
				<li>The extension does not publish on your behalf — you confirm the final submit on the directory.</li>
			{:else}
				<li>Log in on the platform website, then return here and choose Connect.</li>
				<li>
					OpenQuok encrypts session data on the server. The extension stores a refresh token locally to
					re-validate your session about every 24 hours.
				</li>
				<li>Disconnect the channel in OpenQuok to revoke extension refresh for that connection.</li>
			{/if}
		</ul>

		{#if errorMessage}
			<p class="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error" role="alert">
				{errorMessage}
			</p>
		{/if}

		<ChannelConnectLegalFooter browserExtension />

		<Dialog.Footer class="gap-2 sm:gap-2">
			<Button type="button" variant="outline" disabled={busy} onclick={handleCancel}>
				Cancel
			</Button>
			<Button type="button" disabled={busy} onclick={() => void handleConnect()}>
				{#if busy}
					<AbstractIcon
						name={icons.LoaderCircle.name}
						class="mr-2 h-4 w-4 animate-spin"
						width="16"
						height="16"
					/>
					{isDirectoryLaunch ? 'Checking extension…' : 'Connecting…'}
				{:else}
					{isDirectoryLaunch ? 'Continue with extension' : 'Connect with extension'}
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
