<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	import BentoCard from '$lib/ui/templates/bento/BentoCard.svelte';
	import BentoGridOneCol from '$lib/ui/templates/bento/BentoGridOneCol.svelte';
	import BentoLinkedinKanbanPreview from '$lib/ui/templates/bento/minor-templates/linkedin/BentoLinkedinKanbanPreview.svelte';

	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();
</script>

<BentoGridOneCol class={cn('auto-rows-[minmax(22rem,auto)]', className)}>
	<BentoCard
		class="col-span-1 overflow-hidden shadow-2xl ring-1 ring-base-content/10"
		background={BentoLinkedinKanbanPreview}
	/>
</BentoGridOneCol>
