<script lang="ts">
	import type { OnboardingMode } from '$lib/ui/components/onboarding/onboarding.types';

	import {
		ONBOARDING_VIDEO_THUMBNAIL_ALT,
		ONBOARDING_YOUTUBE_VIDEO_ID
	} from '$lib/ui/components/onboarding/onboardingConstants';

	import HeroVideoModal from '$lib/ui/modals/HeroVideoModal.svelte';

	type Props = {
		mode: OnboardingMode;
	};

	let { mode }: Props = $props();

	const onboardingVideoSrc = $derived(
		`https://www.youtube.com/embed/${ONBOARDING_YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`
	);
	const onboardingVideoThumbnailSrc = $derived(
		`https://img.youtube.com/vi/${ONBOARDING_YOUTUBE_VIDEO_ID}/maxresdefault.jpg`
	);

	const tutorialDescription = $derived.by(() => {
		if (mode === 'agent') {
			return 'See how to connect channels, use the CLI, and automate posting with your agent.';
		}
		if (mode === 'mcp') {
			return 'See how to connect channels and schedule posts from Cursor, Claude Code, or another MCP client.';
		}
		return 'See how to connect channels and manage posts from the OpenQuok dashboard.';
	});
</script>

<div class="px-6 py-6">
	<h3 class="text-lg font-semibold text-base-content">Watch a quick tutorial</h3>
	<p class="mt-2 max-w-2xl text-sm text-base-content/70">{tutorialDescription}</p>

	<div class="mx-auto mt-6 max-w-4xl">
		<HeroVideoModal
			animationStyle="from-center"
			videoSrc={onboardingVideoSrc}
			thumbnailSrc={onboardingVideoThumbnailSrc}
			thumbnailAlt={ONBOARDING_VIDEO_THUMBNAIL_ALT}
		/>
	</div>
</div>
