<script lang="ts">
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { integrationsRepository } from '$lib/integrations';
	import { toast } from '$lib/ui/sonner';

	type Props = {
		open?: boolean;
		organizationId: string;
		integrationId: string;
		onClose: () => void;
		onInsert: (mention: string) => void;
	};

	let { open = $bindable(false), organizationId, integrationId, onClose, onInsert }: Props = $props();

	let companyUrl = $state('');
	let loading = $state(false);
	let prevOpen = $state(false);

	$effect(() => {
		if (prevOpen && !open) {
			companyUrl = '';
			onClose();
		}
		prevOpen = open;
	});

	function close() {
		open = false;
	}

	async function resolveCompany() {
		const url = companyUrl.trim();
		if (!url.length) return;
		loading = true;
		try {
			const result = await integrationsRepository.triggerIntegrationTool({
				organizationId,
				integrationId,
				methodName: 'company',
				data: { url }
			});
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			const output = result.output as { options?: { value?: string } } | null;
			const mention = output?.options?.value;
			if (!mention) {
				toast.error('Company not found');
				return;
			}
			onInsert(mention);
			companyUrl = '';
			open = false;
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md gap-4" showCloseButton={!loading}>
		<Dialog.Header>
			<Dialog.Title>Add LinkedIn company mention</Dialog.Title>
			<Dialog.Description class="text-base-content/60 text-xs">
				Paste a company page URL to insert an organization mention.
			</Dialog.Description>
		</Dialog.Header>

		<label class="block">
			<span class="mb-1 block text-xs font-medium text-base-content/70">Company URL</span>
			<input
				type="url"
				class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
				placeholder="https://www.linkedin.com/company/example"
				bind:value={companyUrl}
				disabled={loading}
			/>
		</label>

		<div class="flex justify-end gap-2">
			<Button type="button" variant="outline" size="sm" disabled={loading} onclick={close}>
				Cancel
			</Button>
			<Button
				type="button"
				variant="primary"
				size="sm"
				disabled={loading || !companyUrl.trim()}
				onclick={resolveCompany}
			>
				{loading ? 'Loading…' : 'Add'}
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
