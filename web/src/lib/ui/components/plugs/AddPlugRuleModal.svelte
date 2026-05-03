<script lang="ts">
	import type { GlobalPlugCatalogEntryProgrammerModel } from '$lib/plugs/Plug.repository.svelte';
	import type {
		ConnectedIntegrationChannelViewModel,
		PlugCatalogProviderViewModel
	} from '$lib/plugs/GetPlug.presenter.svelte';

	import * as Dialog from '$lib/ui/dialog';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ImageWithFallback from '$lib/ui/media-files/ImageWithFallback.svelte';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	let {
		open,
		onOpenChange,
		channelIndexForModal,
		onChannelIndexChange,
		pendingNewForMethod,
		onPendingNewForMethodChange,
		supportedChannelsVm,
		catalogForModalChannelVm,
		currentChannelForModalVm,
		fieldDefaults,
		onSaveCatalog
	}: {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		channelIndexForModal: number;
		onChannelIndexChange: (index: number) => void;
		pendingNewForMethod: string | null;
		onPendingNewForMethodChange: (method: string | null) => void;
		supportedChannelsVm: ConnectedIntegrationChannelViewModel[];
		catalogForModalChannelVm: PlugCatalogProviderViewModel | null;
		currentChannelForModalVm: ConnectedIntegrationChannelViewModel | null;
		fieldDefaults: (def: GlobalPlugCatalogEntryProgrammerModel, rowId?: string) => Record<string, string>;
		onSaveCatalog: (
			def: GlobalPlugCatalogEntryProgrammerModel,
			values: Record<string, string>,
			plugId?: string
		) => void | Promise<void>;
	} = $props();
</script>

<Dialog.Root {open} onOpenChange={(next) => onOpenChange(next)}>
	<Dialog.Content class="max-h-[min(90vh,720px)] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl">
		{#if currentChannelForModalVm && catalogForModalChannelVm}
			<Dialog.Header>
				<Dialog.Title class="text-lg">
					Add plug rule — {currentChannelForModalVm.name}
				</Dialog.Title>
				<Dialog.Description class="text-base-content/65">
					Choose a plug type below. To change an existing rule, use <span class="font-medium text-base-content">Edit</span> in
					the table.
				</Dialog.Description>
			</Dialog.Header>

			<div class="mt-4 flex flex-wrap gap-2 border-b border-base-300 pb-4">
				{#each supportedChannelsVm as ch, i (ch.id)}
					<button
						type="button"
						class="border-base-300 hover:bg-base-200/60 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors {channelIndexForModal ===
						i
							? 'bg-base-200 text-base-content ring-2 ring-base-content/15'
							: 'text-base-content/70'}"
						onclick={() => onChannelIndexChange(i)}
					>
						{ch.name}
					</button>
				{/each}
			</div>

			<div class="mt-4 flex items-center gap-3 border-b border-base-300 pb-4">
				<div class="relative h-12 w-12 shrink-0">
					<ImageWithFallback
						src={currentChannelForModalVm.picture ?? ''}
						alt=""
						fallbackIcon={icons.User1.name}
						class="border-base-300 h-12 w-12 rounded-full border object-cover"
					/>
					<span
						class="border-base-300 bg-base-100 absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm ring-2 ring-base-100"
						aria-hidden="true"
					>
						<AbstractIcon
							name={socialProviderIcon(currentChannelForModalVm.identifier)}
							class="text-base-content size-3.5"
							width="14"
							height="14"
						/>
					</span>
				</div>
				<div class="min-w-0">
					<div class="truncate font-medium text-base-content">
						{currentChannelForModalVm.name}</div>
					<div class="text-xs capitalize text-base-content/55">
						{currentChannelForModalVm.identifier}</div>
				</div>
			</div>

			<div class="mt-6 space-y-6">
				{#each catalogForModalChannelVm.plugs as def (def.methodName)}
					<div class="rounded-xl border border-base-300 bg-base-200/20 p-5 shadow-sm">
						<div class="mb-4">
							<h2 class="text-lg font-semibold">
								{def.title}</h2>
							<p class="mt-1 text-sm text-base-content/65">
								{def.description}</p>
							<p class="mt-2 text-xs text-base-content/45">
								Checks every {Math.round(def.runEveryMilliseconds / 3600000)}h · up to {def.totalRuns} run{def.totalRuns === 1 ? '' : 's'}
							</p>
						</div>

						{#if pendingNewForMethod === def.methodName}
							{@const draftValues = fieldDefaults(def)}
							<div class="border-base-300 bg-base-100/30 mt-4 rounded-lg border border-dashed p-4">
								<div class="mb-3 text-xs font-medium text-base-content/55">
									New rule</div>
								<form
									class="space-y-4"
									onsubmit={(e) => {
										e.preventDefault();
										const fd = new FormData(e.currentTarget);
										const next: Record<string, string> = {};
										for (const f of def.fields) {
											next[f.name] = String(fd.get(f.name) ?? '');
										}
										void onSaveCatalog(def, next);
									}}
								>
									{#each def.fields as f (f.name)}
										<label class="block">
											<span class="mb-1 block text-xs font-medium text-base-content/70">{f.description}</span>
											{#if f.type === 'richtext'}
												<textarea
													name={f.name}
													rows={4}
													class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
													placeholder={f.placeholder}
													value={draftValues[f.name] ?? ''}
												></textarea>
											{:else}
												<input
													name={f.name}
													type={f.type === 'number' ? 'number' : 'text'}
													class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
													placeholder={f.placeholder}
													value={draftValues[f.name] ?? ''}
												/>
											{/if}
										</label>
									{/each}
									<div class="flex flex-wrap justify-end gap-2">
										<Button
											type="button"
											variant="outline"
											onclick={() => onPendingNewForMethodChange(null)}
										>
											Cancel
										</Button>
										<Button type="submit" variant="primary">Save rule</Button>
									</div>
								</form>
							</div>
						{/if}

						<Button
							type="button"
							variant="outline"
							class="mt-4 w-full sm:w-auto"
							disabled={pendingNewForMethod === def.methodName}
							onclick={() => onPendingNewForMethodChange(def.methodName)}
						>
							Add rule
						</Button>
					</div>
				{/each}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
