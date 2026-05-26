<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type Props = {
		open?: boolean;
		upgradeHref?: string;
		onOpenChange?: (open: boolean) => void;
	};

	let { open = $bindable(false), upgradeHref, onOpenChange }: Props = $props();
</script>

<Dialog.Root
	bind:open
	onOpenChange={(next: boolean) => {
		onOpenChange?.(next);
	}}
>
	<Dialog.Content class="max-w-lg" showCloseButton>
		<Dialog.Header>
			<Dialog.Title>Upgrade to add team members</Dialog.Title>
			<Dialog.Description>
				This workspace has reached its team member limit for your current plan. Upgrade to invite
				collaborators, or remove members and pending invites to free seats.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Dialog.Close>
				<Button type="button" variant="ghost">
					Not now
				</Button>
			</Dialog.Close>
			{#if upgradeHref}
				<Button href={upgradeHref} variant="primary" class="gap-1.5">
					<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
					View plans
				</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
