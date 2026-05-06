<script lang="ts">
	import type { SignatureProgrammerModel } from '$lib/signatures';
	import type { SignatureViewModel } from '$lib/signatures/GetSignature.presenter.svelte';
	import type { UpdateSignatureInput, CreateSignatureInput } from '$lib/signatures/signature.types';

	import { onMount, untrack } from 'svelte';
	import { toast } from '$lib/ui/sonner';
	import * as Dialog from '$lib/ui/dialog';
	import * as Field from '$lib/ui/field';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { icons } from '$data/icons';

	import { createSignatureSchema, SignaturesStatus, updateSignatureSchema } from '$lib/signatures';

	import SignatureBox from '$lib/ui/components/signature/SignatureBox.svelte';
	import { workspaceSettingsPresenter } from '$lib/settings';

	type Props = {
		status: SignaturesStatus;
		itemsVm: SignatureViewModel[];
		showToastMessage: boolean;
		toastMessage: string;
		toastIsError: boolean;
		onClearToast: () => void;
		onLoadSignaturesForOrganization: (organizationId: string) => void | Promise<void>;
		onCreateSignature: (
			organizationId: string,
			input: Omit<CreateSignatureInput, 'organizationId'>
		) => Promise<boolean>;
		onUpdateSignature: (id: string, input: UpdateSignatureInput) => Promise<boolean>;
		onDeleteSignature: (id: string) => Promise<boolean>;
	};

	let {
		status,
		itemsVm,
		showToastMessage,
		toastMessage,
		toastIsError,
		onClearToast,
		onLoadSignaturesForOrganization,
		onCreateSignature,
		onUpdateSignature,
		onDeleteSignature
	}: Props = $props();

	let createOpen = $state(false);
	let editOpen = $state(false);
	let confirmDeleteOpen = $state(false);
	let selected: SignatureProgrammerModel | null = $state(null);

	let title = $state('');
	let content = $state('');
	let isDefault = $state(false);
	let autoAddValue = $state<'true' | 'false'>('false');

	const busy = $derived(status !== SignaturesStatus.IDLE);
	const items = $derived(itemsVm);
	const organizationId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	onMount(() => {
		void workspaceSettingsPresenter.load({ includeTeam: false });
	});

	$effect(() => {
		const oid = organizationId;
		if (!oid) return;
		void onLoadSignaturesForOrganization(oid);
	});

	$effect(() => {
		if (!showToastMessage) return;
		if (toastIsError) toast.error(toastMessage);
		else toast.success(toastMessage);
		onClearToast();
	});

	function resetForm() {
		title = '';
		content = '';
		isDefault = false;
		autoAddValue = 'false';
	}

	function openCreate() {
		if (!organizationId) {
			toast.error('Loading workspace… try again in a moment.');
			return;
		}
		resetForm();
		createOpen = true;
	}

	function openEdit(sig: SignatureProgrammerModel) {
		selected = sig;
		untrack(() => {
			title = sig.title ?? '';
			content = sig.content ?? '';
			isDefault = sig.isDefault ?? false;
			autoAddValue = (sig.isDefault ?? false) ? 'true' : 'false';
		});
		editOpen = true;
	}

	function openDelete(sig: SignatureProgrammerModel) {
		selected = sig;
		confirmDeleteOpen = true;
	}

	async function submitCreate() {
		const oid = organizationId;
		if (!oid) {
			toast.error('No workspace selected.');
			return;
		}
		isDefault = autoAddValue === 'true';
		const parsed = createSignatureSchema.safeParse({ organizationId: oid, title, content, isDefault });
		if (!parsed.success) {
			toast.error(parsed.error.issues.map((i) => i.message).join(' '));
			return;
		}
		const ok = await onCreateSignature(oid, {
			title: parsed.data.title,
			content: parsed.data.content,
			isDefault: parsed.data.isDefault
		});
		if (ok) createOpen = false;
	}

	async function submitEdit() {
		const oid = organizationId;
		if (!selected || !oid) return;
		isDefault = autoAddValue === 'true';
		const parsed = updateSignatureSchema.safeParse({ title, content, isDefault });
		if (!parsed.success) {
			toast.error(parsed.error.issues.map((i) => i.message).join(' '));
			return;
		}
		const ok = await onUpdateSignature(selected.id, parsed.data);
		if (ok) editOpen = false;
	}

	async function handleDeleteSelected() {
		const oid = organizationId;
		if (!selected || !oid) return;
		const ok = await onDeleteSignature(selected.id);
		if (ok) {
			confirmDeleteOpen = false;
			selected = null;
		}
	}

	async function handleSetDefault(id: string) {
		const oid = organizationId;
		if (!oid) return;
		await onUpdateSignature(id, { isDefault: true });
	}
</script>

<section class="rounded-lg border border-base-300 bg-base-200 shadow-sm overflow-hidden">
	<div class="flex flex-col gap-1 p-4 sm:p-6">
		<div class="flex items-center justify-between gap-3">
			<div>
				<h3 class="text-sm font-semibold text-base-content">Signatures</h3>
				<p class="mt-1 text-sm leading-snug text-base-content/70">
					Pre-write a snippet eg. hashtags, sign-offs, or other text you use often. They are shared with
					everyone in this workspace.
				</p>
			</div>
			<Button
				type="button"
				variant="primary"
				size="sm"
				class="gap-1.5"
				disabled={busy || !organizationId}
				onclick={openCreate}
			>
				<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
				New signature
			</Button>
		</div>
	</div>

	<div class="border-t border-base-300 p-4 sm:p-6">
		{#if !organizationId}
			<div class="rounded-lg border border-base-300 bg-base-100 p-4 text-sm text-base-content/70">
				Loading workspace…
			</div>
		{:else if busy && items.length === 0}
			<div class="text-sm text-base-content/70">Loading…</div>
		{:else if items.length === 0}
			<div class="rounded-lg border border-base-300 bg-base-100 p-4 text-sm text-base-content/70">
				No signatures yet for this workspace.
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-3">
				{#each items as sig (sig.id)}
					<SignatureBox
						signature={sig}
						{busy}
						onEdit={openEdit}
						onDelete={() => openDelete(sig)}
						onSetDefault={handleSetDefault}
					/>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- Create -->
<Dialog.Root bind:open={createOpen}>
	<Dialog.Content class="max-w-lg">
		<form
			method="dialog"
			onsubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void submitCreate();
			}}
			class="space-y-4"
		>
			<Dialog.Header>
				<Dialog.Title>Add Signature</Dialog.Title>
				<Dialog.Description>Add a snippet you can insert quickly into posts.</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-3">
				<div>
					<Field.Label>Title</Field.Label>
					<input
						bind:value={title}
						class="mt-1 w-full rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
						placeholder="e.g. Default signature"
						disabled={busy}
					/>
				</div>
				<div>
					<Field.Label>Content</Field.Label>
					<textarea
						bind:value={content}
						rows={4}
						class="mt-1 w-full resize-none rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
						placeholder="e.g. — Rati, OpenQuok"
						disabled={busy}
					></textarea>
				</div>
				<div>
					<Field.Label>Auto add signature?</Field.Label>
					<select
						class="mt-1 w-full rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
						bind:value={autoAddValue}
						disabled={busy}
					>
						<option value="false">No</option>
						<option value="true">Yes</option>
					</select>
				</div>
			</div>

			<Dialog.Footer class="gap-2 sm:justify-end">
				<Button type="button" variant="ghost" disabled={busy} onclick={() => (createOpen = false)}>
					Cancel
				</Button>
				<Button type="submit" variant="primary" disabled={busy}>
					{busy ? 'Saving…' : 'Save'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit -->
<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="max-w-lg">
		<form
			method="dialog"
			onsubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void submitEdit();
			}}
			class="space-y-4"
		>
			<Dialog.Header>
				<Dialog.Title>Edit Signature</Dialog.Title>
			</Dialog.Header>

			<div class="space-y-3">
				<div>
					<Field.Label>Title</Field.Label>
					<input
						bind:value={title}
						class="mt-1 w-full rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
						disabled={busy}
					/>
				</div>
				<div>
					<Field.Label>Content</Field.Label>
					<textarea
						bind:value={content}
						rows={4}
						class="mt-1 w-full resize-none rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
						disabled={busy}
					></textarea>
				</div>
				<div>
					<Field.Label>Auto add signature?</Field.Label>
					<select
						class="mt-1 w-full rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
						bind:value={autoAddValue}
						disabled={busy}
					>
						<option value="false">No</option>
						<option value="true">Yes</option>
					</select>
				</div>
			</div>

			<Dialog.Footer class="gap-2 sm:justify-end">
				<Button type="button" variant="ghost" disabled={busy} onclick={() => (editOpen = false)}>
					Cancel
				</Button>
				<Button type="submit" variant="primary" disabled={busy || !selected?.id}>
					{busy ? 'Saving…' : 'Save'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Confirm delete -->
<Dialog.Root bind:open={confirmDeleteOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Delete signature?</Dialog.Title>
			<Dialog.Description>
				This will permanently delete <strong>{selected?.title ?? 'this signature'}</strong>.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="gap-2 sm:justify-end">
			<Button type="button" variant="ghost" disabled={busy} onclick={() => (confirmDeleteOpen = false)}>
				Cancel
			</Button>
			<Button
				type="button"
				variant="ghost"
				class="border-0 bg-error text-error-content hover:bg-error/90"
				disabled={busy || !selected?.id}
				onclick={() => void handleDeleteSelected()}
			>
				Delete
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

