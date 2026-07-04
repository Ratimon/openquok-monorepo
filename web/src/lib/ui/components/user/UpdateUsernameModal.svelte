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
		<form id="username-form" method="dialog" onsubmit={onSubmit} class="space-y-4">
			<Dialog.Header>
				<Dialog.Title>Update username</Dialog.Title>
				<Dialog.Description>
					Your public creator URL uses this username for building blocks, playbooks, and your
					profile page.
				</Dialog.Description>
			</Dialog.Header>

			<form.Field name="username">
				{#snippet children(field: any)}
					<div>
						<Field.Label field={field} for="profile-username">Username</Field.Label>
						<input
							id="profile-username"
							type="text"
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							class="input input-bordered w-full"
							placeholder="your-name"
							autocomplete="username"
							spellcheck="false"
						/>
						<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
					</div>
				{/snippet}
			</form.Field>

			<Dialog.Footer>
				<Dialog.Close>
					<Button type="button" variant="ghost">Close</Button>
				</Dialog.Close>
				<form.Subscribe selector={(state: any) => ({ isSubmitting: state.isSubmitting })}>
					{#snippet children(state: any)}
						<Button type="submit" form="username-form" disabled={state.isSubmitting}>
							{state.isSubmitting ? 'Saving…' : 'Save'}
						</Button>
					{/snippet}
				</form.Subscribe>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
