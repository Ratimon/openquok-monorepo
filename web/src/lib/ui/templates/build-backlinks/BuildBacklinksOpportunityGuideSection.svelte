<script lang="ts">
	import type { BuildBacklinksGuideSectionVm } from '$lib/link-directory/utils/site/buildBuildBacklinksGuideSections';

	import BuildBacklinksOpportunityStepsPanel from '$lib/ui/templates/build-backlinks/BuildBacklinksOpportunityStepsPanel.svelte';

	type Props = {
		section: BuildBacklinksGuideSectionVm;
	};

	let { section }: Props = $props();
</script>

<BuildBacklinksOpportunityStepsPanel {section} />
