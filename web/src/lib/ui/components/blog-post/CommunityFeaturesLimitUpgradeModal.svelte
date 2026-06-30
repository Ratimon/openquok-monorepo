<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type UpgradeFeature = 'community' | 'bookmarks';

	type Props = {
		open?: boolean;
		upgradeHref?: string;
		feature?: UpgradeFeature;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		open = $bindable(false),
		upgradeHref,
		feature = 'community',
		onOpenChange
	}: Props = $props();

	const title = $derived(
		feature === 'bookmarks' ? 'Upgrade to bookmark extensions' : 'Upgrade for community features'
	);

	const description = $derived(
		feature === 'bookmarks'
			? 'Bookmark extensions and access your saved list on a paid plan. Upgrade to get started.'
			: 'Blog comments and other community features are not included on your current plan. Upgrade to Creator or higher to join the conversation on blog posts.'
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
