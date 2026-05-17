<script lang="ts">
	import * as Dialog from '$lib/ui/dialog';
	import * as Field from '$lib/ui/field';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		open?: boolean;
		form: {
			Field: any;
			Subscribe: any;
		};
		onSubmit: (e: Event) => void;
	};

	let { open = $bindable(false), form, onSubmit }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<form id="workspace-update-form" method="dialog" onsubmit={onSubmit} class="space-y-4">
			<Dialog.Header>
				<Dialog.Title>
					Edit workspace
				</Dialog.Title>
				<Dialog.Description>
					Update the workspace name and description shown to your team.
				</Dialog.Description>
			</Dialog.Header>

			<form.Field name="workspaceName">
				{#snippet children(field: any)}
					<div>
						<Field.Label field={field} for="workspace-update-name">
							Workspace name
						</Field.Label>
						<input
							id="workspace-update-name"
							type="text"
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							class="input input-bordered w-full"
							placeholder="My Workspace"
							autocomplete="organization"
						/>
						<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
					</div>
				{/snippet}
			</form.Field>

			<form.Field name="workspaceDescription">
				{#snippet children(field: any)}
					<div>
						<Field.Label field={field} for="workspace-update-description">
							Description
						</Field.Label>
						<textarea
							id="workspace-update-description"
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							class="textarea textarea-bordered w-full min-h-24"
							placeholder="Optional notes for your team"
							rows={3}
						></textarea>
						<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
					</div>
				{/snippet}
			</form.Field>

			<Dialog.Footer>
				<Dialog.Close>
					<Button type="button" variant="ghost">
						Close
					</Button>
				</Dialog.Close>
				<form.Subscribe selector={(state: any) => ({ isSubmitting: state.isSubmitting })}>
					{#snippet children(state: any)}
						<Button type="submit" form="workspace-update-form" disabled={state.isSubmitting}>
							{state.isSubmitting ? 'Saving…' : 'Save'}
						</Button>
					{/snippet}
				</form.Subscribe>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
