<script lang="ts">
	import { workspaceCreateFormSchema } from '$lib/settings';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import * as Field from '$lib/ui/field';

	type Props = {
		creating?: boolean;
		onCreateWorkspace: (name: string) => Promise<{ success: boolean; message: string }>;
	};

	let { creating = false, onCreateWorkspace }: Props = $props();

	const defaultNewWorkspaceName = 'My Workspace';

	let createDialogOpen = $state(false);

	const createWorkspaceForm = createForm(() => ({
		defaultValues: {
			workspaceName: defaultNewWorkspaceName
		},
		validators: {
			onChange: workspaceCreateFormSchema
		},
		onSubmit: async ({ value }) => {
			const result = await onCreateWorkspace(value.workspaceName);
			if (result.success) {
				createDialogOpen = false;
				toast.success(result.message);
			} else {
				toast.error(result.message);
			}
		}
	}));

	function openCreateDialog() {
		createWorkspaceForm.setFieldValue('workspaceName', defaultNewWorkspaceName);
		createDialogOpen = true;
	}

	function handleCreateFormSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (
			createWorkspaceForm.state.errors &&
			createWorkspaceForm.state.errors.length > 0 &&
			createWorkspaceForm.state.errors[0]
		) {
			Object.entries(
				createWorkspaceForm.state.errors[0] as Record<string, Array<{ message?: string }>>
			).forEach(([, errors]) => {
				errors.forEach((err) => toast.error(err?.message ?? 'Invalid field'));
			});
			return;
		}
		createWorkspaceForm.handleSubmit();
	}
</script>

<button
	type="button"
	class="flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-base-300 bg-base-200/40 p-6 text-center transition-colors hover:border-primary/50 hover:bg-base-200/80"
	onclick={openCreateDialog}
	disabled={creating}
>
	<span
		class="flex size-14 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/80"
		aria-hidden="true"
	>
		<AbstractIcon name={icons.Plus.name} class="size-7" width="28" height="28" />
	</span>
	<span class="text-base font-semibold text-base-content">
		Create a new one
	</span>
	<span class="max-w-[14rem] text-xs text-base-content/60">
		Add another workspace for a separate team or brand.
	</span>
</button>

<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content>
		<form
			id="dashboard-create-workspace-form"
			method="dialog"
			onsubmit={handleCreateFormSubmit}
			class="space-y-4"
		>
			<Dialog.Header>
				<Dialog.Title>
					Create new workspace
				</Dialog.Title>
				<Dialog.Description>
					Workspaces keep members, channels, and posts separate from your other workspaces.
				</Dialog.Description>
			</Dialog.Header>
			<createWorkspaceForm.Field name="workspaceName">
				{#snippet children(field)}
					<div>
						<Field.Label field={field} for="dashboard-create-workspace-name">
							Workspace name
						</Field.Label>
						<input
							id="dashboard-create-workspace-name"
							type="text"
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							class="input input-bordered w-full"
							placeholder="My Workspace"
						/>
						<Field.Error
							errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
						/>
					</div>
				{/snippet}
			</createWorkspaceForm.Field>
			<Dialog.Footer>
				<Dialog.Close>
					<Button type="button" variant="ghost">
						Cancel
					</Button>
				</Dialog.Close>
				<createWorkspaceForm.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
					{#snippet children(state)}
						<Button
							type="submit"
							form="dashboard-create-workspace-form"
							variant="primary"
							disabled={state.isSubmitting || creating}
						>
							{state.isSubmitting || creating ? 'Creating…' : 'Create workspace'}
						</Button>
					{/snippet}
				</createWorkspaceForm.Subscribe>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
