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
		<form id="website-form" method="dialog" onsubmit={onSubmit} class="space-y-4">
			<Dialog.Header>
				<Dialog.Title>Update website</Dialog.Title>
			</Dialog.Header>

			<form.Field name="websiteUrl">
				{#snippet children(field: any)}
					<div>
						<Field.Label field={field} for="profile-website-url">Website</Field.Label>
						<p class="mt-1 text-xs text-base-content/60">
							Optional — link shown as your author site on blog posts.
						</p>
						<input
							id="profile-website-url"
							type="url"
							inputmode="url"
							autocomplete="url"
							placeholder="https://example.com"
							value={field.state.value ?? ''}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							class="input input-bordered mt-2 w-full"
						/>
						<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
					</div>
				{/snippet}
			</form.Field>

			<Dialog.Footer>
				<Dialog.Close>
					<Button
						type="button"
						variant="ghost"
					>
						Close
					</Button>
				</Dialog.Close>
				<form.Subscribe selector={(state: any) => ({ isSubmitting: state.isSubmitting })}>
					{#snippet children(state: any)}
						<Button
							type="submit"
							form="website-form"
							disabled={state.isSubmitting}
						>
							{state.isSubmitting ? 'Saving…' : 'Save'}
						</Button>
					{/snippet}
				</form.Subscribe>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
