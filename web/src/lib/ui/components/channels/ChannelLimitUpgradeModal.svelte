<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type ChannelLimitVariant = 'connected' | 'active';

	type Props = {
		open?: boolean;
		upgradeHref?: string;
		variant?: ChannelLimitVariant;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		open = $bindable(false),
		upgradeHref,
		variant = 'connected',
		onOpenChange
	}: Props = $props();

	const title = $derived(
		variant === 'active' ? 'Upgrade to enable a channel' : 'Upgrade to add a channel'
	);
	const description = $derived(
		variant === 'active'
			? 'Your current plan has reached its active channel limit for this workspace. Disable another channel or upgrade to a higher tier to enable this one.'
			: 'Your current plan has reached its connected channel limit for this workspace. Upgrade to a higher tier to connect more channels.'
	);
</script>

<Dialog.Root
	bind:open
	onOpenChange={(next: boolean) => {
		onOpenChange?.(next);
	}}
>
	<Dialog.Content class="max-w-lg" showCloseButton>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				{description}
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
