<script lang="ts">
	import type { IconName } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		name: IconName;
		class?: string;
	};

	let { name, class: className = '' }: Props = $props();
</script>

<AbstractIcon {name} width="16" height="16" class={cn('shrink-0', className)} />
