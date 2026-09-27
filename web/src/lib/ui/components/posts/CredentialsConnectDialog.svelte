<script lang="ts">
	import {
		credentialsConnectFormUsesSingleApiKey,
		type IntegrationCatalogCustomField
	} from '$lib/integrations/utils/credentialsConnect';

	import * as Dialog from '$lib/ui/dialog';
	import CredentialsConnectForm from '$lib/ui/components/posts/CredentialsConnectForm.svelte';

	type Props = {
		open?: boolean;
		providerName: string;
		providerIdentifier?: string;
		fields: IntegrationCatalogCustomField[];
		submitting?: boolean;
		onSubmit: (values: Record<string, string>) => void | Promise<void>;
		onCancel?: () => void;
	};

	let {
		open = $bindable(false),
		providerName,
		providerIdentifier = '',
		fields,
		submitting = false,
		onSubmit,
		onCancel
	}: Props = $props();

	function handleCancel() {
		if (submitting || connectPrefillBusy) return;
		open = false;
		onCancel?.();
	}

	const isSingleApiKeyForm = $derived(credentialsConnectFormUsesSingleApiKey(fields));

	let connectPrefillBusy = $state(false);

	const connectDescription = $derived(
		providerIdentifier === 'bluesky'
			? 'Use a Bluesky app password with your handle and PDS service URL. Two-factor auth can stay on — not your main account password.'
			: isSingleApiKeyForm
				? 'This channel uses an API key instead of an OAuth redirect.'
				: 'This channel uses pasted account credentials instead of an OAuth redirect. OpenQuok encrypts them on the server.'
	);
</script>

<Dialog.Root
	bind:open
	onOpenChange={(next) => {
		if (!next && (submitting || connectPrefillBusy)) {
			open = true;
			return;
		}
		if (!next) {
			onCancel?.();
		}
	}}
>
	<Dialog.Content class="max-w-md gap-4" showCloseButton={!submitting && !connectPrefillBusy}>
		<Dialog.Header>
			<Dialog.Title>Connect {providerName}</Dialog.Title>
			<Dialog.Description class="text-base-content/60 text-xs">
				{connectDescription}
			</Dialog.Description>
		</Dialog.Header>
		<CredentialsConnectForm
			{providerName}
			{providerIdentifier}
			{fields}
			{submitting}
			{onSubmit}
			onCancel={handleCancel}
			onResolvingChange={(busy) => {
				connectPrefillBusy = busy;
			}}
		/>
	</Dialog.Content>
</Dialog.Root>
