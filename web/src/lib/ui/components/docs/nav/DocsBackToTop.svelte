<script lang="ts">
	import { icons } from '$data/icon';

	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<Button variant="ghost" size="icon" onclick={scrollToTop} aria-label="Back to top">
	<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
</Button>
