<script lang="ts">
	import type { IntegrationCatalogCustomField } from '$lib/integrations/utils/credentialsConnect';

	import { validateCatalogCustomFieldValue } from '$lib/integrations/utils/credentialsConnect';
	import { toast } from '$lib/ui/sonner';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		providerName: string;
		fields: IntegrationCatalogCustomField[];
		submitting?: boolean;
		onSubmit: (values: Record<string, string>) => void | Promise<void>;
		onCancel?: () => void;
	};

	let { providerName, fields, submitting = false, onSubmit, onCancel }: Props = $props();

	let values = $state<Record<string, string>>({});

	const canSubmit = $derived(
		!submitting && fields.every((field) => (values[field.key] ?? '').trim().length > 0)
	);

	function fieldValue(key: string): string {
		return values[key] ?? '';
	}

	function setFieldValue(key: string, next: string) {
		values = { ...values, [key]: next };
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const next: Record<string, string> = {};
		for (const field of fields) {
			const value = (values[field.key] ?? '').trim();
			const error = validateCatalogCustomFieldValue(field, value);
			if (error) {
				toast.error(error);
				return;
			}
			next[field.key] = value;
		}
		await onSubmit(next);
	}
</script>

<form class="space-y-4" onsubmit={handleSubmit}>
	<p class="text-sm text-base-content/70">
		Paste your {providerName} API key to connect this channel. The key is stored on the channel and is
		not used as an operator OAuth app.
	</p>

	{#each fields as field (field.key)}
		<label class="block">
			<span class="mb-1 block text-xs font-medium text-base-content/70">{field.label}</span>
			<input
				class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
				type={field.type === 'password' ? 'password' : 'text'}
				autocomplete="off"
				spellcheck="false"
				disabled={submitting}
				value={fieldValue(field.key)}
				oninput={(e) => setFieldValue(field.key, e.currentTarget.value)}
			/>
		</label>
	{/each}

	<div class="flex justify-end gap-2">
		{#if onCancel}
			<Button type="button" variant="outline" size="sm" disabled={submitting} onclick={onCancel}>
				Cancel
			</Button>
		{/if}
		<Button type="submit" variant="primary" size="sm" disabled={!canSubmit}>
			{submitting ? 'Connecting…' : 'Connect'}
		</Button>
	</div>
</form>
