<script lang="ts">
	import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/publicChannelConfig';

	import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
	import { route } from '$lib/utils/path';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicSoonBadge from '$lib/ui/components/PublicSoonBadge.svelte';

	type Props = {
		channelsVm: PublicChannelLandingPageViewModel[];
	};

	let { channelsVm }: Props = $props();

	const headingId = 'public-channels-hub-heading';
</script>

<section class="py-10 md:py-14" aria-labelledby={headingId}>
	<div class="mx-auto max-w-3xl space-y-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">Channels</p>
		<h1
			id={headingId}
			class="text-3xl font-black tracking-tight text-balance text-base-content sm:text-4xl"
		>
			Schedule posts to every social channel
		</h1>
		<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			See which social platforms you can connect — Facebook, Threads, Instagram, YouTube, TikTok,
			and more — then schedule posts from one workspace while you stay in control of what publishes.
		</p>
	</div>

	<ul
		class="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
		aria-label="Social channels you can connect"
	>
		{#each channelsVm as channelVm (channelVm.slug)}
			{@const href = route(getRootPathPublicChannel(channelVm.slug))}
			<li>
				<a
					href={href}
					class="group flex h-full flex-col gap-4 rounded-2xl border p-6 transition {channelVm.available
						? 'border-base-content/10 bg-base-200/40 hover:border-primary/40 hover:bg-base-200/70'
						: 'border-dashed border-base-content/15 bg-base-200/20 opacity-90 hover:border-base-content/25 hover:bg-base-200/30'}"
				>
					<div class="flex items-start justify-between gap-3">
						<span
							class="grid size-12 place-items-center rounded-xl border border-white/10 bg-base-100/80"
							aria-hidden="true"
						>
							<AbstractIcon
								name={channelVm.icon}
								width="28"
								height="28"
								class="size-7 {channelVm.available ? '' : 'opacity-70'}"
								focusable="false"
							/>
						</span>
						{#if !channelVm.available}
							<PublicSoonBadge label="Coming soon" />
						{/if}
					</div>
					<div class="space-y-2 text-left">
						<h2
							class="text-lg font-bold {channelVm.available
								? 'text-base-content group-hover:text-primary'
								: 'text-base-content/80'}"
						>
							{channelVm.platformLabel}
						</h2>
						<p
							class="text-sm leading-relaxed {channelVm.available
								? 'text-base-content/70'
								: 'text-base-content/60'}"
						>
							{channelVm.hubDescription ?? channelVm.metaDescription}
						</p>
					</div>
					<span
						class="mt-auto text-sm font-semibold {channelVm.available
							? 'text-primary'
							: 'text-base-content/50'}"
					>
						{channelVm.available ? 'View scheduler →' : 'Preview coming soon →'}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</section>
