<script lang="ts">
	import type { IntegrationCatalogCustomField } from '$lib/integrations/utils/credentialsConnect';

	import * as Dialog from '$lib/ui/dialog';
	import CredentialsConnectForm from '$lib/ui/components/posts/CredentialsConnectForm.svelte';

	type Props = {
		open?: boolean;
		providerName: string;
		fields: IntegrationCatalogCustomField[];
		submitting?: boolean;
		onSubmit: (values: Record<string, string>) => void | Promise<void>;
		onCancel?: () => void;
	};

	let {
		open = $bindable(false),
		providerName,
		fields,
		submitting = false,
		onSubmit,
		onCancel
	}: Props = $props();

	function notifyCancel() {
		if (submitting) return;
		onCancel?.();
	}

	function handleCancel() {
		open = false;
		notifyCancel();
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(next) => {
		if (!next) notifyCancel();
	}}
>
	<Dialog.Content class="max-w-md gap-4" showCloseButton={!submitting}>
		<Dialog.Header>
			<Dialog.Title>Connect {providerName}</Dialog.Title>
			<Dialog.Description class="text-base-content/60 text-xs">
				This channel uses an API key instead of an OAuth redirect.
			</Dialog.Description>
		</Dialog.Header>
		<CredentialsConnectForm
			{providerName}
			{fields}
			{submitting}
			{onSubmit}
			onCancel={handleCancel}
		/>
	</Dialog.Content>
</Dialog.Root>
