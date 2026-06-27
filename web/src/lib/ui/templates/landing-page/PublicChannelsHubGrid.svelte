<script lang="ts">
	import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/publicChannelConfig';

	import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
	import { route } from '$lib/utils/path';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

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
			{@const href = channelVm.available ? route(getRootPathPublicChannel(channelVm.slug)) : undefined}
			<li>
				{#if href}
					<a
						href={href}
						class="group flex h-full flex-col gap-4 rounded-2xl border border-base-content/10 bg-base-200/40 p-6 transition hover:border-primary/40 hover:bg-base-200/70"
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
									class="size-7"
									focusable="false"
								/>
							</span>
						</div>
						<div class="space-y-2 text-left">
							<h2 class="text-lg font-bold text-base-content group-hover:text-primary">
								{channelVm.platformLabel}
							</h2>
							<p class="text-sm leading-relaxed text-base-content/70">
								{channelVm.hubDescription ?? channelVm.metaDescription}
							</p>
						</div>
						<span class="mt-auto text-sm font-semibold text-primary">View scheduler →</span>
					</a>
				{:else}
					<div
						class="flex h-full flex-col gap-4 rounded-2xl border border-dashed border-base-content/15 bg-base-200/20 p-6 opacity-80"
					>
						<div class="flex items-start justify-between gap-3">
							<span
								class="grid size-12 place-items-center rounded-xl border border-white/10 bg-base-100/50"
								aria-hidden="true"
							>
								<AbstractIcon
									name={channelVm.icon}
									width="28"
									height="28"
									class="size-7 opacity-70"
									focusable="false"
								/>
							</span>
							<span
								class="rounded-full bg-base-content/10 px-2.5 py-0.5 text-xs font-semibold text-base-content/60 uppercase"
							>
								Coming soon
							</span>
						</div>
						<div class="space-y-2 text-left">
							<h2 class="text-lg font-bold text-base-content/80">
								{channelVm.platformLabel}
							</h2>
							<p class="text-sm leading-relaxed text-base-content/60">
								{channelVm.hubDescription ?? channelVm.metaDescription}
							</p>
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</section>
