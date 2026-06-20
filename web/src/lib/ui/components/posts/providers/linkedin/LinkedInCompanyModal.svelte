<script lang="ts">
	import Button from '$lib/ui/buttons/Button.svelte';
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
			onClose();
		} finally {
			loading = false;
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose();
		}}
	>
		<div
			class="border-base-300 bg-base-100 w-full max-w-md rounded-xl border p-5 shadow-xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="linkedin-company-title"
		>
			<h2 id="linkedin-company-title" class="text-base font-semibold text-base-content">
				Add LinkedIn company mention
			</h2>
			<p class="mt-1 text-xs text-base-content/60">
				Paste a company page URL to insert an organization mention.
			</p>
			<label class="mt-4 block">
				<span class="mb-1 block text-xs font-medium text-base-content/70">Company URL</span>
				<input
					type="url"
					class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
					placeholder="https://www.linkedin.com/company/example"
					bind:value={companyUrl}
					disabled={loading}
				/>
			</label>
			<div class="mt-4 flex justify-end gap-2">
				<Button type="button" variant="outline" size="sm" disabled={loading} onclick={onClose}>
					Cancel
				</Button>
				<Button type="button" variant="primary" size="sm" disabled={loading || !companyUrl.trim()} onclick={resolveCompany}>
					{loading ? 'Loading…' : 'Add'}
				</Button>
			</div>
		</div>
	</div>
{/if}
