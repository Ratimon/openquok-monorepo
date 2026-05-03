<script lang="ts">
	import type {
		GlobalPlugCatalogEntryProgrammerModel,
		IntegrationPlugRowProgrammerModel
	} from '$lib/plugs/Plug.repository.svelte';
	import type { PlugRuleTableRowViewModel } from '$lib/plugs/GetPlug.presenter.svelte';

	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';

	let {
		editorVm,
		getFieldDefaults,
		onClose,
		onSave
	}: {
		editorVm: PlugRuleTableRowViewModel | null;
		getFieldDefaults: (
			def: GlobalPlugCatalogEntryProgrammerModel,
			rowPm: IntegrationPlugRowProgrammerModel
		) => Record<string, string>;
		onClose: () => void;
		onSave: (
			def: GlobalPlugCatalogEntryProgrammerModel,
			values: Record<string, string>,
			plugId: string,
			integrationId: string
		) => void | Promise<void>;
	} = $props();

	const open = $derived(editorVm !== null);
</script>

<Dialog.Root
	{open}
	onOpenChange={(nextOpen) => {
		if (!nextOpen) onClose();
	}}
>
	<Dialog.Content class="max-h-[min(90vh,640px)] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
		{#if editorVm?.catalogEntry}
			{@const def = editorVm.catalogEntry}
			{@const values = getFieldDefaults(def, editorVm.plugRowPm)}
			<Dialog.Header>
				<Dialog.Title class="text-lg">
					Edit rule — {editorVm.ruleTitle}
				</Dialog.Title>
				<Dialog.Description class="text-base-content/65">
					{editorVm.channelName} · {editorVm.platformLabel}
				</Dialog.Description>
			</Dialog.Header>
			<form
				class="mt-4 space-y-4"
				onsubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					const next: Record<string, string> = {};
					for (const f of def.fields) {
						next[f.name] = String(fd.get(f.name) ?? '');
					}
					void onSave(def, next, editorVm.id, editorVm.integrationId);
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
								value={values[f.name] ?? ''}
							></textarea>
						{:else}
							<input
								name={f.name}
								type={f.type === 'number' ? 'number' : 'text'}
								class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
								placeholder={f.placeholder}
								value={values[f.name] ?? ''}
							/>
						{/if}
					</label>
				{/each}
				<div class="flex justify-end gap-2 pt-2">
					<Button type="button" variant="outline" onclick={onClose}>Cancel</Button>
					<Button type="submit" variant="primary">
						Save
					</Button>
				</div>
			</form>
		{:else if editorVm}
			<Dialog.Header>
				<Dialog.Title class="text-lg">
					Unknown plug type
				</Dialog.Title>
				<Dialog.Description class="text-base-content/65">
					This rule uses <code class="text-xs">{editorVm.plugRowPm.plug_function}</code> which is not in
					the current catalog.
				</Dialog.Description>
			</Dialog.Header>
			<div class="mt-4 flex justify-end">
				<Button type="button" variant="outline" onclick={onClose}>
					Close
				</Button>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
