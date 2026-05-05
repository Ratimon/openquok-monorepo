<script lang="ts">
	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		open?: boolean;
		busy?: boolean;
		initialName?: string;
		title?: string;
		onConfirm: (name: string) => void | Promise<void>;
		onCancel: () => void;
	};

	let {
		open = $bindable(false),
		busy = false,
		initialName = '',
		title = 'Save Template',
		onConfirm,
		onCancel
	}: Props = $props();

	let name = $state('');

	$effect(() => {
		if (open) {
			name = initialName ?? '';
		}
	});

	async function submit(e: Event) {
		e.preventDefault();
		const t = name.trim();
		if (!t || busy) return;
		await onConfirm(t);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>Give this preset a short name so you can pick it when creating posts.</Dialog.Description>
		</Dialog.Header>
		<form class="mt-4 space-y-4" onsubmit={submit}>
			<div class="flex flex-col gap-1.5">
				<label class="text-base-content/80 text-sm font-medium" for="set-name">
					Set name</label>
				<input
					id="set-name"
					type="text"
					class="border-base-300 bg-base-100 focus:border-primary focus:ring-primary/30 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
					autocomplete="off"
					disabled={busy}
					bind:value={name}
					placeholder="e.g. Launch week bundle"
				/>
			</div>
			<Dialog.Footer class="mt-2 flex flex-wrap gap-2">
				<Button type="submit" variant="primary" disabled={busy || !name.trim()}>
					Save
				</Button>
				<Button type="button" variant="secondary" disabled={busy} onclick={() => onCancel()}>
					Cancel
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
