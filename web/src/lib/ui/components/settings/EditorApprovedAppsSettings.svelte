<script lang="ts">
	import type { ApprovedAppRowViewModel } from '$lib/settings/ApprovedAppsSettings.presenter.svelte';
	import { ApprovedAppsSettingsStatus } from '$lib/settings/ApprovedAppsSettings.presenter.svelte';

	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		status: ApprovedAppsSettingsStatus;
		itemsVm: ApprovedAppRowViewModel[];
		revokingAuthorizationId: string | null;
		onRevoke: (authorizationId: string) => void | Promise<void>;
	};

	let { status, itemsVm, revokingAuthorizationId, onRevoke }: Props = $props();

	let confirmOpen = $state(false);
	let pendingAuthorizationId = $state<string | null>(null);
	let pendingAppName = $state('');

	function openConfirm(row: ApprovedAppRowViewModel) {
		pendingAuthorizationId = row.authorizationId;
		pendingAppName = row.appName;
		confirmOpen = true;
	}

	function closeConfirm() {
		confirmOpen = false;
		pendingAuthorizationId = null;
		pendingAppName = '';
	}

	async function confirmRevoke() {
		const id = pendingAuthorizationId;
		if (!id) return;
		closeConfirm();
		await onRevoke(id);
	}

	const loading = $derived(status === ApprovedAppsSettingsStatus.LOADING);
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-xl font-semibold text-base-content">Approved Apps</h3>
		<p class="mt-1 text-sm text-base-content/70">
			Applications you have authorized to access your Openquok account on your behalf.
		</p>
	</div>

	<div class="rounded-lg border border-base-300 bg-base-200 p-6">
		{#if loading}
			<p class="text-sm text-base-content/70">Loading…</p>
		{:else if itemsVm.length === 0}
			<p class="text-sm text-base-content/70">No approved apps yet.</p>
		{:else}
			<ul class="flex flex-col gap-4">
				{#each itemsVm as row (row.authorizationId)}
					<li
						class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-base-300 bg-base-100 p-4"
					>
						<div class="flex min-w-0 items-center gap-3">
							{#if row.pictureUrl}
								<img
									src={row.pictureUrl}
									alt=""
									class="size-10 shrink-0 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-300 text-sm font-semibold text-base-content/70"
								>
									{row.appName.charAt(0).toUpperCase() || '?'}
								</div>
							{/if}
							<div class="min-w-0">
								<p class="truncate font-medium text-base-content">{row.appName}</p>
								{#if row.description}
									<p class="truncate text-sm text-base-content/70">{row.description}</p>
								{/if}
								<p class="text-xs text-base-content/60">
									Authorized on {row.authorizedOnLabel}
								</p>
							</div>
						</div>
						<Button
							type="button"
							variant="outline"
							class="shrink-0"
							disabled={revokingAuthorizationId !== null}
							onclick={() => openConfirm(row)}
						>
							{revokingAuthorizationId === row.authorizationId ? 'Revoking…' : 'Revoke'}
						</Button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<Dialog.Root bind:open={confirmOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>
				Revoke access?
			</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to revoke access for {pendingAppName}? That application will no longer be able to act
				on your behalf until you authorize it again.
			</Dialog.Description>
		</Dialog.Header>
		<div class="mt-6 flex justify-end gap-2">
			<Button type="button" variant="ghost" onclick={() => closeConfirm()}>Cancel</Button>
			<Button type="button" variant="red" onclick={() => void confirmRevoke()}>Revoke access</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
