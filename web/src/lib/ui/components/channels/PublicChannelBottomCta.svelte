<script lang="ts">
	import type { PublicChannelLandingPage } from '$lib/content/constants/publicChannelCatalog';

	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import Background from '$lib/ui/background/Background.svelte';

	type Props = {
		channel: PublicChannelLandingPage;
		ctaHref: string;
		ctaLabel: string;
	};

	let { channel, ctaHref, ctaLabel }: Props = $props();
</script>

<Background color="bg-base-200">
	<section class="relative isolate px-4 py-16 sm:px-6 sm:py-20 lg:px-8" aria-labelledby="channel-bottom-cta-heading">
		<div class="mx-auto max-w-3xl space-y-6 text-center">
			<h2
				id="channel-bottom-cta-heading"
				class="text-2xl font-black tracking-tight text-balance text-base-content sm:text-3xl"
			>
				Ready to schedule {channel.platformLabel} posts?
			</h2>
			<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
				Connect {channel.platformLabel}, queue your calendar, and publish from the dashboard or your
				agents — with OpenQuok keeping approval in your hands.
			</p>
			<ButtonGlitchBrightness
				class="mx-auto my-2 w-full max-w-xs justify-center rounded-full px-10 text-sm sm:text-base"
				variant="primary"
				size="lg"
				href={ctaHref}
				preload="off"
			>
				{ctaLabel}
			</ButtonGlitchBrightness>
		</div>
	</section>
</Background>
