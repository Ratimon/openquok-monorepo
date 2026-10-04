<script lang="ts">
	import PublicListingDetailHeroTitle from '$lib/ui/templates/titles/PublicListingDetailHeroTitle.svelte';

	type Props = {
		title: string;
		headingId?: string;
		class?: string;
	};

	let props: Props = $props();
</script>

<PublicListingDetailHeroTitle {...props} />
