<script lang="ts">
	import { thirdPartyRepository } from '$lib/third-parties';
	import type { ThirdPartyConnectorVm } from '$lib/third-parties';
	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type Props = {
		organizationId: string;
		onImported?: () => void;
	};

	let { organizationId, onImported }: Props = $props();

	let loaded = $state(false);
	let integrations = $state<ThirdPartyConnectorVm[]>([]);
	let dialogOpen = $state(false);
	let selected = $state<ThirdPartyConnectorVm | null>(null);

	const libraryIntegrations = $derived(integrations.filter((p) => p.position === 'media-library'));

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

	function placeholderImport(): void {
		toast.message('This import source is not configured yet.');
	}
</script>

{#if loaded && libraryIntegrations.length > 0}
	<Button type="button" variant="secondary" class="gap-2" onclick={openDialog}>
		<AbstractIcon name={icons.FolderPen.name} class="size-4" width="16" height="16" />
		Import
	</Button>

	<Dialog.Root bind:open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
		<Dialog.Content class="flex max-h-[min(92vh,720px)] w-[min(96vw,56rem)] max-w-[min(96vw,56rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,56rem)]">
			<Dialog.Header class="border-base-300 shrink-0 border-b px-5 py-4">
				<Dialog.Title class="text-base font-semibold">Import from a connected source</Dialog.Title>
				<Dialog.Description class="text-sm text-base-content/70">
					Choose a workspace connector, then pick files to copy into your library.
				</Dialog.Description>
			</Dialog.Header>

			<div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
				{#if !selected}
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{#each libraryIntegrations as p (p.id)}
							<button
								type="button"
								class="border-base-300 hover:border-primary/50 flex flex-col gap-2 rounded-xl border bg-base-200/30 p-4 text-left transition-colors"
								onclick={() => (selected = p)}
							>
								<div class="text-base font-semibold text-base-content">
									{p.title}: {p.name}</div>
								<div class="line-clamp-3 text-sm text-base-content/70">
									{p.description}</div>
								<span class="text-primary text-sm font-medium">Continue →</span>
							</button>
						{/each}
					</div>
				{:else}
					<button
						type="button"
						class="text-primary mb-4 text-sm font-medium hover:underline"
						onclick={() => (selected = null)}
					>
						← Back
					</button>
					<p class="text-base-content/80 mb-4 text-sm">
						<span class="font-medium text-base-content">{selected.title}: {selected.name}</span>
						— browsing and import for this connector will appear here once the integration is enabled on the
						server.
					</p>
					<Button type="button" variant="primary" class="w-fit" onclick={placeholderImport}>
						Try import (preview)
					</Button>
				{/if}
			</div>

			<Dialog.Footer class="border-base-300 shrink-0 flex-wrap gap-2 border-t px-5 py-3">
				<Button type="button" variant="ghost" onclick={closeDialog}>
					Close</Button>
				{#if selected}
					<Button
						type="button"
						variant="secondary"
						onclick={() => {
							onImported?.();
							closeDialog();
						}}
					>
						Done
					</Button>
				{/if}
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
