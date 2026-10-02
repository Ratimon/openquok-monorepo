<script lang="ts">
	import type { PageData } from './$types';

	import BuildBacklinksHubPageContent from '$lib/ui/templates/build-backlinks/BuildBacklinksHubPageContent.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();
</script>

<BuildBacklinksHubPageContent {data} />
