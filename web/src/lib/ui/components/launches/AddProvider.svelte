<script lang="ts">
    import type { IntegrationCatalogItemProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';
	import type{ IconName } from '$data/icon';

	import { goto } from '$app/navigation';
	import { getRootPathAccount } from '$lib/area-protected';
	import { absoluteUrl, route } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icon';

	import { integrationsRepository } from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';

    import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		/** Path to return to after OAuth (path only, e.g. `/account`). Passed to the integration backend as `externalUrl`. */
		returnToPath?: string;
		buttonLabel?: string;
	};

	let { returnToPath, buttonLabel = 'Add Channel' }: Props = $props();

	let open = $state(false);
	let loading = $state(false);
	let providers = $state<IntegrationCatalogItemProgrammerModel[]>([]);

	const currentWorkspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	const iconByProvider: Record<string, IconName> = {
		facebook: icons.Facebook.name,
		instagram: icons.Instagram.name,
		youtube: icons.YouTube.name,
		tiktok: icons.TikTok.name,
		x: icons.X.name
		// threads: (not in icon registry yet) -> fallback
	};

	function providerIcon(identifier: string): IconName {
		return iconByProvider[identifier] ?? icons.Link.name;
	}

	async function ensureWorkspaceLoaded() {
		if (currentWorkspaceId) return;
		await workspaceSettingsPresenter.load();
	}

	async function loadProviders() {
		loading = true;
		try {
			providers = await integrationsRepository.getCatalog();
		} catch {
			providers = [];
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (!open) return;
		void ensureWorkspaceLoaded().then(() => {
			if (!workspaceSettingsPresenter.currentWorkspaceId) {
				toast.error('Create or select a workspace in Account settings before adding channels.');
				open = false;
				return;
			}
			void loadProviders();
		});
	});

	function onPickProvider(identifier: string) {
		const workspaceId = workspaceSettingsPresenter.currentWorkspaceId;
		if (!workspaceId) {
			toast.error('Create or select a workspace before connecting a channel.');
			return;
		}
		open = false;
		const accountRoot = route(getRootPathAccount());
		const afterConnect = returnToPath ?? accountRoot;
		const connectPath = `${accountRoot}/integrations/social/${encodeURIComponent(identifier)}`;
		const qs = new URLSearchParams({
			organizationId: workspaceId,
			returnTo: afterConnect
		});
		goto(absoluteUrl(`${connectPath}?${qs}`));
	}
</script>

<Dialog.Root bind:open>
	<Button class="gap-2" type="button" onclick={() => (open = true)}>
		<AbstractIcon name={icons.Plus.name} class="h-4 w-4" width="16" height="16" />
		{buttonLabel}
	</Button>

	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Add a channel</Dialog.Title>
			<Dialog.Description>
				Connect a social account to start publishing.
			</Dialog.Description>
		</Dialog.Header>

		{#if loading}
			<div class="flex items-center gap-2 py-6 text-base-content/70">
				<AbstractIcon
					name={icons.LoaderCircle.name}
					class="h-4 w-4 animate-spin"
					width="16"
					height="16"
				/>
				Loading providers…
			</div>
		{:else if providers.length === 0}
			<div class="py-6 text-sm text-base-content/70">
				No providers available right now.
			</div>
		{:else}
			<div class="grid gap-2 py-2">
				{#each providers as p (p.identifier)}
					<button
						type="button"
						class="flex w-full items-center justify-between rounded-lg border border-base-300 bg-base-100 px-3 py-3 text-left hover:bg-base-200"
						onclick={() => onPickProvider(p.identifier)}
					>
						<div class="flex items-center gap-3">
							<div class="grid h-10 w-10 place-items-center rounded-md bg-base-200">
								<AbstractIcon name={providerIcon(p.identifier)} class="h-5 w-5" width="20" height="20" />
							</div>
							<div class="min-w-0">
								<div class="font-medium text-base-content">{p.name ?? p.identifier}</div>
								<div class="text-xs text-base-content/70">{p.identifier}</div>
							</div>
						</div>
						<div class="text-base-content/60">
							<AbstractIcon name={icons.ChevronRight.name} class="h-4 w-4" width="16" height="16" />
						</div>
					</button>
				{/each}
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="ghost" type="button" onclick={() => (open = false)}>Close</Button>
		</Dialog.Footer>

	</Dialog.Content>
</Dialog.Root>

