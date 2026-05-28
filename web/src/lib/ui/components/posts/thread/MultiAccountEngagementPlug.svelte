<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';

	import Button from '$lib/ui/buttons/Button.svelte';
	import Switch from '$lib/ui/switch/switch.svelte';

	type PlugValue = {
		enabled: boolean;
		/** Other integration IDs in this workspace that will engage/comment. */
		integrationIds: string[];
	};

	type Props = {
		channels: CreateSocialPostChannelViewModel[];
		currentIntegrationId: string;
		identifier: string;
		value?: Partial<PlugValue>;
		onChange: (next: PlugValue) => void;
		disabled?: boolean;
	};

	let { channels, currentIntegrationId, identifier, value = {}, onChange, disabled = false }: Props = $props();

	let enabled = $state(false);
	let integrationIds = $state<string[]>([]);

	let lastLoadedSig = $state('');
	let lastEmittedSig = $state('');

	const eligibleChannels = $derived.by(() => {
		const key = (identifier ?? '').toLowerCase();
		return channels.filter((c) => (c.identifier ?? '').toLowerCase() === key && c.id !== currentIntegrationId);
	});

	$effect(() => {
		const nextEnabled = value.enabled === true;
		const nextIds = Array.isArray(value.integrationIds)
			? (value.integrationIds as unknown[]).filter((x): x is string => typeof x === 'string')
			: [];
		const sig = JSON.stringify({ enabled: nextEnabled, integrationIds: nextIds });
		if (sig === lastLoadedSig) return;
		lastLoadedSig = sig;
		enabled = nextEnabled;
		integrationIds = nextIds;
	});

	$effect(() => {
		const sig = JSON.stringify({ enabled, integrationIds });
		if (sig === lastEmittedSig) return;
		lastEmittedSig = sig;
		onChange({ enabled, integrationIds });
	});

	function toggleIntegrationId(id: string) {
		if (integrationIds.includes(id)) {
			integrationIds = integrationIds.filter((x) => x !== id);
		} else {
			integrationIds = [...integrationIds, id];
		}
	}
</script>

<div class="border-base-300 bg-base-200/30 rounded-lg border p-4">
	<div class="flex items-center justify-between gap-3">
		<div>
			<div class="text-sm font-medium text-base-content/80">Other accounts engagement</div>
			<p class="mt-1 text-xs text-base-content/55">
				Uses other connected accounts in this workspace to add engagement comments.
			</p>
		</div>
		<Switch bind:checked={enabled} disabled={disabled} />
	</div>

	<div class="mt-4 space-y-3 {enabled ? '' : 'opacity-40 pointer-events-none'}">
		{#if eligibleChannels.length === 0}
			<p class="text-xs text-base-content/55">No other eligible connected accounts found.</p>
		{:else}
			<div class="space-y-2">
				<div class="text-xs font-medium text-base-content/70">Accounts that will engage</div>
				<div class="space-y-1">
					{#each eligibleChannels as ch (ch.id)}
						<label class="flex items-center gap-2 text-sm text-base-content/80">
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								checked={integrationIds.includes(ch.id)}
								disabled={disabled || !enabled}
								onchange={() => toggleIntegrationId(ch.id)}
							/>
							<span class="truncate">{ch.name}</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<div class="flex justify-end">
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={!enabled || disabled}
				onclick={() => {
					const ids = eligibleChannels.map((c) => c.id);
					integrationIds = integrationIds.length === ids.length ? [] : ids;
				}}
			>
				Toggle all
			</Button>
		</div>
	</div>
</div>

