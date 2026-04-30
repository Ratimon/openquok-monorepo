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
		<form id="name-form" method="dialog" onsubmit={onSubmit} class="space-y-4">
			<Dialog.Header>
				<Dialog.Title>Update full name</Dialog.Title>
			</Dialog.Header>

			<form.Field name="fullName">
				{#snippet children(field: any)}
					<div>
						<Field.Label field={field} for="profile-fullname">Full name</Field.Label>
						<input
							id="profile-fullname"
							type="text"
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							class="input input-bordered w-full"
							placeholder="Your name"
							autocomplete="name"
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
						<Button type="submit" form="name-form" disabled={state.isSubmitting}>
							{state.isSubmitting ? 'Saving…' : 'Save'}
						</Button>
					{/snippet}
				</form.Subscribe>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
