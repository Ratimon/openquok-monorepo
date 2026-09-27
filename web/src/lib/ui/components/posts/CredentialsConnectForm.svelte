<script lang="ts">
	import type { IntegrationCatalogCustomField } from '$lib/integrations/utils/credentialsConnect';

	import { page } from '$app/state';
	import { integrationsRepository } from '$lib/integrations';
	import {
		blueskyIdentifierSkipsPdsResolve,
		credentialsConnectFormUsesSingleApiKey,
		initialCredentialsConnectValues,
		validateCatalogCustomFieldValue
	} from '$lib/integrations/utils/credentialsConnect';
	import { isOpenquokHostedOrigin } from '$lib/utils/hostedMarketingHref';
	import { toast } from '$lib/ui/sonner';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CircularProgressBar from '$lib/ui/circular-progress-bar/CircularProgressBar.svelte';

	type Props = {
		providerName: string;
		providerIdentifier?: string;
		fields: IntegrationCatalogCustomField[];
		submitting?: boolean;
		onSubmit: (values: Record<string, string>) => void | Promise<void>;
		onCancel?: () => void;
		/** Fired when Bluesky PDS prefill is in flight (parent can block dialog close). */
		onResolvingChange?: (resolving: boolean) => void;
	};

	let {
		providerName,
		providerIdentifier = '',
		fields,
		submitting = false,
		onSubmit,
		onCancel,
		onResolvingChange
	}: Props = $props();

	let values = $state<Record<string, string>>({});
	let resolvingPds = $state(false);
	let progressValue = $state(45);

	const fieldsKey = $derived(fields.map((field) => field.key).join('\0'));

	$effect(() => {
		void fieldsKey;
		values = initialCredentialsConnectValues(fields);
	});

	const isHostedCloud = $derived(isOpenquokHostedOrigin(page.url.origin));
	const isSingleApiKeyForm = $derived(credentialsConnectFormUsesSingleApiKey(fields));

	const canSubmit = $derived(
		!submitting &&
			!resolvingPds &&
			fields.every((field) => (values[field.key] ?? '').trim().length > 0)
	);

	const showBlueskyPdsLookup = $derived(providerIdentifier === 'bluesky' && resolvingPds);

	$effect(() => {
		if (!resolvingPds) {
			progressValue = 0;
			return;
		}
		let frame = 0;
		const start = Date.now();
		const tick = () => {
			const t = (Date.now() - start) / 1000;
			progressValue = 55 + 35 * Math.sin(t * 1.6);
			frame = requestAnimationFrame(tick);
		};
		tick();
		return () => cancelAnimationFrame(frame);
	});

	function setResolvingPds(next: boolean) {
		resolvingPds = next;
		onResolvingChange?.(next);
	}

	function fieldValue(key: string): string {
		return values[key] ?? '';
	}

	function setFieldValue(key: string, next: string) {
		values = { ...values, [key]: next };
	}

	async function maybePrefillConnectFieldFromIdentifier(identifier: string) {
		if (providerIdentifier !== 'bluesky' || submitting || resolvingPds) return;
		const trimmed = identifier.trim();
		if (!trimmed || blueskyIdentifierSkipsPdsResolve(trimmed)) return;
		setResolvingPds(true);
		try {
			const result = await integrationsRepository.connectPrefill(
				providerIdentifier,
				'identifier',
				trimmed
			);
			if (result.ok && 'updates' in result && result.updates.service) {
				setFieldValue('service', result.updates.service);
			}
		} finally {
			setResolvingPds(false);
		}
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
		{#if isSingleApiKeyForm}
			{#if isHostedCloud}
				Paste your {providerName} API key. OpenQuok encrypts it on the server to publish for you — it is
				not saved in your browser.
			{:else}
				Paste your {providerName} API key. OpenQuok keeps it on the server to publish for you — it is not
				saved in your browser.
			{/if}
		{:else if isHostedCloud}
			Enter your {providerName} account details below. OpenQuok encrypts them on the server to publish for
			you — they are not saved in your browser.
		{:else}
			Enter your {providerName} account details below. OpenQuok keeps them on the server to publish for you
			— they are not saved in your browser.
		{/if}
	</p>

	{#each fields as field (field.key)}
		<label class="block">
			<span class="mb-1 block text-xs font-medium text-base-content/70">{field.label}</span>
			<input
				class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
				type={field.type === 'password' ? 'password' : 'text'}
				autocomplete="off"
				spellcheck="false"
				disabled={submitting || resolvingPds}
				value={fieldValue(field.key)}
				oninput={(e) => setFieldValue(field.key, e.currentTarget.value)}
				onblur={() => {
					if (field.key === 'identifier') {
						void maybePrefillConnectFieldFromIdentifier(fieldValue('identifier'));
					}
				}}
			/>
		</label>
	{/each}

	{#if showBlueskyPdsLookup}
		<div
			class="border-base-300 bg-base-200/40 flex flex-col items-center gap-2 rounded-md border px-4 py-4"
			role="status"
			aria-live="polite"
			aria-busy="true"
		>
			<CircularProgressBar value={progressValue} size={72} strokeWidth={6} showLabel={false} />
			<p class="text-center text-sm text-base-content/85">Looking up your PDS service URL…</p>
			<p class="text-center text-xs text-base-content/60">
				This can take a few seconds. Please keep this window open.
			</p>
		</div>
	{/if}

	<div class="flex justify-end gap-2">
		{#if onCancel}
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={submitting || resolvingPds}
				onclick={onCancel}
			>
				Cancel
			</Button>
		{/if}
		<Button type="submit" variant="primary" size="sm" disabled={!canSubmit}>
			{submitting ? 'Connecting…' : 'Connect'}
		</Button>
	</div>
</form>
