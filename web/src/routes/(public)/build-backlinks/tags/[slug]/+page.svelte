<script lang="ts">
	import type { PageData } from './$types';

	import type { BuildBacklinksHubPageContentData } from '$lib/link-directory/buildBacklinksHubPageContent.types';

	import BuildBacklinksHubPageContent from '$lib/ui/templates/build-backlinks/BuildBacklinksHubPageContent.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const hubData = $derived(data as unknown as BuildBacklinksHubPageContentData);
</script>

<BuildBacklinksHubPageContent data={hubData} />
