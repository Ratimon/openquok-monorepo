<script lang="ts">
	import { icons } from '$data/icons';
	import { socialProviderDisplayLabel, socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		platformKey: string;
		channelLimitFull?: boolean;
		class?: string;
		onClick: () => void;
	};

	let { platformKey, channelLimitFull = false, class: className, onClick }: Props = $props();

	const platformLabel = $derived(socialProviderDisplayLabel(platformKey));
</script>

<Button
	type="button"
	variant="ghost"
	size="sm"
	class={cn(
		'h-8 shrink-0 gap-1.5 px-2 text-xs whitespace-nowrap',
		channelLimitFull
			? 'border border-warning/35 bg-warning/5 text-warning hover:border-warning/50 hover:bg-warning/10'
			: 'border-base-300',
		className
	)}
	aria-label={channelLimitFull
		? `Channel limit reached — cannot add another ${platformLabel} connection`
		: `Add another ${platformLabel} connection`}
	onclick={onClick}
>
	<span class="inline-flex items-center gap-1.5" aria-hidden="true">
		<AbstractIcon
			name={channelLimitFull ? icons.Lock.name : icons.Plus.name}
			class="size-3.5"
			width="14"
			height="14"
		/>
		{channelLimitFull ? 'Limit reached' : 'Add more'}
		<AbstractIcon
			name={socialProviderIcon(platformKey)}
			class={cn('size-3.5', channelLimitFull && 'opacity-70')}
			width="14"
			height="14"
		/>
	</span>
</Button>
