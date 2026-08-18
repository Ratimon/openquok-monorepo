<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();
</script>

<span
	class="bg-base-100 text-base-content/80 ring-base-100 absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full ring-1 {className}"
	aria-hidden="true"
>
	<AbstractIcon name={icons.Lock.name} class="size-2.5" width="10" height="10" />
</span>
