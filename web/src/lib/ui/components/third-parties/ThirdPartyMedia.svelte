<script lang="ts">
	import type { ThirdPartyConnectorVm } from '$lib/third-parties';
	
	import { thirdPartyRepository } from '$lib/third-parties';
	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type Props = {
		organizationId: string;
	};

	let { organizationId }: Props = $props();

	let loaded = $state(false);
	let integrations = $state<ThirdPartyConnectorVm[]>([]);
	let dialogOpen = $state(false);
	let selected = $state<ThirdPartyConnectorVm | null>(null);

	const mediaIntegrations = $derived(integrations.filter((p) => p.position === 'media'));

	async function load(): Promise<void> {
		if (!organizationId) {
			integrations = [];
			loaded = true;
			return;
		}
		integrations = await thirdPartyRepository.listForOrganization(organizationId);
		loaded = true;
	}

	$effect(() => {
		void load();
	});

	function openDialog(): void {
		selected = null;
		dialogOpen = true;
	}

	function closeDialog(): void {
		dialogOpen = false;
		selected = null;
	}

	function placeholderUse(): void {
		toast.message('This connector is not configured yet.');
	}
</script>

{#if loaded && mediaIntegrations.length > 0}
	<Button type="button" variant="ghost" class="h-9 gap-1.5 px-2 text-sm" onclick={openDialog}>
		<AbstractIcon name={icons.Settings.name} class="size-4" width="16" height="16" />
		<span class="hidden sm:inline">Integrations</span>
	</Button>

	<Dialog.Root bind:open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
		<Dialog.Content class="max-h-[min(88vh,640px)] w-[min(96vw,40rem)] max-w-[min(96vw,40rem)] overflow-y-auto">
			<Dialog.Header>
				<Dialog.Title>Integrations</Dialog.Title>
				<Dialog.Description class="text-base-content/75 text-sm">
					Connectors that can extend the editor will be listed here.
				</Dialog.Description>
			</Dialog.Header>

			{#if !selected}
				<div class="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
					{#each mediaIntegrations as p (p.id)}
						<button
							type="button"
							class="border-base-300 hover:border-primary/50 flex flex-col gap-2 rounded-xl border bg-base-200/30 p-4 text-left"
							onclick={() => (selected = p)}
						>
							<div class="text-sm font-semibold">
								{p.title}: {p.name}</div>
							<div class="line-clamp-3 text-xs text-base-content/70">
								{p.description}</div>
						</button>
					{/each}
				</div>
			{:else}
				<button type="button" class="text-primary mb-3 text-sm font-medium hover:underline" onclick={() => (selected = null)}>
					← Back
				</button>
				<p class="text-base-content/80 mb-4 text-sm">
					{selected.description}</p>
				<Button type="button" variant="secondary" onclick={placeholderUse}>
					Use</Button>
			{/if}

			<Dialog.Footer class="mt-4">
				<Button type="button" variant="ghost" onclick={closeDialog}>
					Close</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
