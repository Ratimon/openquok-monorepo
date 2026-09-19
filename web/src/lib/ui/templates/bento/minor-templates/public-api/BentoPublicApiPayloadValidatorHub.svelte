<script lang="ts">
	import type { PublicApiHubStaticExample } from '$lib/content/constants/apis/types';

	import { cn } from '$lib/ui/helpers/common';

	import BentoCard from '$lib/ui/templates/bento/BentoCard.svelte';
	import BentoGridOneCol from '$lib/ui/templates/bento/BentoGridOneCol.svelte';
	import BentoPublicApiPayloadValidatorHubPreview from '$lib/ui/templates/bento/minor-templates/public-api/BentoPublicApiPayloadValidatorHubPreview.svelte';

	type Props = {
		class?: string;
		staticExample: PublicApiHubStaticExample;
		platformSlug?: PublicApiPlatformSlug | null;
		isLoggedIn?: boolean;
	};

	let { class: className = '', staticExample, platformSlug = null, isLoggedIn }: Props = $props();
</script>

<BentoGridOneCol class={cn('auto-rows-[minmax(22rem,auto)]', className)}>
	<BentoCard
		class="col-span-1 overflow-hidden shadow-2xl ring-1 ring-base-content/10"
		background={BentoPublicApiPayloadValidatorHubPreview}
		backgroundProps={{ staticExample, platformSlug, isLoggedIn }}
	/>
</BentoGridOneCol>
