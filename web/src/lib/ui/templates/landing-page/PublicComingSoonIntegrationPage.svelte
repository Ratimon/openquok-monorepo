<script lang="ts">
	import type { IconName } from '$data/icons';

	import { getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';
	import { route } from '$lib/utils/path';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicSoonBadge from '$lib/ui/components/PublicSoonBadge.svelte';
	import AuroraBackground from '$lib/ui/background/AuroraBackground.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';

	type Props = {
		platformLabel: string;
		icon: IconName;
		/** When set, copy references scheduling via this agent (e.g. OpenClaw). */
		agentLabel?: string;
		/** Hero band only — omit standalone navigation (channel pages render sections below). */
		heroOnly?: boolean;
		backHref?: string;
		backLabel?: string;
	};

	const channelsHubPath = route(getRootPathPublicChannels());

	let {
		platformLabel,
		icon,
		agentLabel,
		heroOnly = false,
		backHref = channelsHubPath,
		backLabel = 'Browse available channels'
	}: Props = $props();

	const headingId = 'public-coming-soon-heading';

	let title = $derived(
		agentLabel
			? `${platformLabel} with ${agentLabel} is coming soon`
			: `${platformLabel} scheduling is coming soon`
	);

	let description = $derived(
		agentLabel
			? `We are finishing the ${platformLabel} integration for ${agentLabel}. Check back soon for platform-specific workflows, examples, and setup guides.`
			: `We are putting the finishing touches on ${platformLabel} in OpenQuok — connect, compose, schedule, and approve from one workspace. This channel will be available shortly.`
	);
</script>

<AuroraBackground class="relative isolate overflow-hidden">
	<div
		class="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 {heroOnly
			? 'py-16 sm:py-20'
			: 'py-20 sm:py-28'}"
	>
		<div class="flex flex-col items-center text-center">
			<div class="relative mb-6">
				<div
					class="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-base-100/10 shadow-lg backdrop-blur-sm"
					aria-hidden="true"
				>
					<AbstractIcon name={icon} width="36" height="36" class="size-9 opacity-80" focusable="false" />
				</div>
				<div class="absolute -top-2 -right-3">
					<PublicSoonBadge />
				</div>
			</div>

			<p class="text-xs font-bold tracking-[0.2em] text-primary uppercase sm:text-sm">
				{platformLabel}
			</p>

			<h1
				id={headingId}
				class="mt-4 text-3xl font-black tracking-tight text-balance text-base-content sm:text-4xl lg:text-5xl"
			>
				{title}
			</h1>

			<p class="mt-6 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
				{description}
			</p>

			{#if !heroOnly}
				<div class="mt-10 flex flex-wrap items-center justify-center gap-3">
					<ButtonGlitchBrightness href={backHref} variant="primary" size="lg" preload="off">
						{backLabel}
					</ButtonGlitchBrightness>
					<ButtonGlitchBrightness href={channelsHubPath} variant="outline" size="lg" preload="off">
						View all channels
					</ButtonGlitchBrightness>
				</div>
			{/if}
		</div>
	</div>
</AuroraBackground>
