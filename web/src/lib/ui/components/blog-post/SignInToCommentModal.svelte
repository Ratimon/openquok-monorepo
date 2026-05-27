<script lang="ts">
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type Props = {
		open?: boolean;
		signInHref: string;
	};

	let { open = $bindable(false), signInHref }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md" showCloseButton>
		<Dialog.Header>
			<Dialog.Title>Sign in to comment</Dialog.Title>
			<Dialog.Description>
				Sign in to add collaboration comments on this share link.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Dialog.Close>
				<Button type="button" variant="ghost">
					Not now
				</Button>
			</Dialog.Close>
			<Button href={signInHref} variant="primary" checkCurrent={false}>
				Sign in
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
