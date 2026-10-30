<script lang="ts">
	import type { FeaturesOrderedMarketingPanelId } from '$lib/content/constants/agents/types';

	import AnimatedBeamDirectoryProfile from '$lib/ui/templates/landing-page/AnimatedBeamDirectoryProfile.svelte';
	import BentoLandingDirectoryAutofillPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingDirectoryAutofillPreview.svelte';
	import BentoLandingDirectoryHumanPacePreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingDirectoryHumanPacePreview.svelte';
	import BentoLandingDirectoryProfileCasesPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingDirectoryProfileCasesPreview.svelte';
	import BentoLandingDirectoryTrackStatusPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingDirectoryTrackStatusPreview.svelte';
	import BentoLandingAddChannelDialogPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingAddChannelDialogPreview.svelte';
	import BentoLandingBrowserExtensionSidePanelPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingBrowserExtensionSidePanelPreview.svelte';
	import BentoLandingBrowserExtensionWorkflowsPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingBrowserExtensionWorkflowsPreview.svelte';
	import DirectoryChannelLaunchOptionsPreview from '$lib/ui/templates/bento/minor-templates/landing/DirectoryChannelLaunchOptionsPreview.svelte';
	import type { PublicDirectoryChannelSlug } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelProcessSection';

	type Props = {
		panel: FeaturesOrderedMarketingPanelId;
		ariaLabel?: string;
		directoryChannelSlug?: PublicDirectoryChannelSlug;
	};

	let { panel, ariaLabel, directoryChannelSlug }: Props = $props();
</script>

<div
	class="flex size-full min-h-[320px] w-full items-stretch overflow-hidden rounded-xl border border-base-content/10 bg-base-100 shadow-lg ring-1 ring-base-content/10 lg:min-h-[380px]"
	role="img"
	aria-label={ariaLabel}
>
	{#if panel === 'directory-profile-readiness'}
		<BentoLandingDirectoryProfileCasesPreview initialTab="incomplete" showTabs={false} />
	{:else if panel === 'directory-pick-destinations'}
		<div class="flex w-full items-center p-3 sm:p-4">
			<AnimatedBeamDirectoryProfile />
		</div>
	{:else if panel === 'directory-extension-autofill'}
		<BentoLandingDirectoryAutofillPreview />
	{:else if panel === 'directory-human-pace'}
		<BentoLandingDirectoryHumanPacePreview />
	{:else if panel === 'directory-launch-opportunities' && directoryChannelSlug}
		<DirectoryChannelLaunchOptionsPreview channelSlug={directoryChannelSlug} />
	{:else if panel === 'directory-track-status'}
		<BentoLandingDirectoryTrackStatusPreview />
	{:else if panel === 'browser-extension-side-panel'}
		<BentoLandingBrowserExtensionSidePanelPreview />
	{:else if panel === 'browser-extension-connect'}
		<BentoLandingAddChannelDialogPreview />
	{:else if panel === 'browser-extension-workflows'}
		<BentoLandingBrowserExtensionWorkflowsPreview />
	{/if}
</div>
