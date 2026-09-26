<script lang="ts">
	import type { PublicChannelSiblingGridItem } from '$lib/content/utils/buildPublicChannelSiblingGridCopy';

	import {
		buildPublicAgentChannelSiblingGridCardDescription,
		buildPublicAgentChannelSiblingGridDescription,
		buildPublicAgentChannelSiblingGridHubDescription,
		buildPublicAgentChannelSiblingGridHubTitle,
		buildPublicAgentChannelSiblingGridTitle,
		buildPublicChannelSiblingGridCardDescription,
		buildPublicChannelSiblingGridDescription,
		buildPublicChannelSiblingGridTitle
	} from '$lib/content/utils/buildPublicChannelSiblingGridCopy';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import { url } from '$lib/utils/path';

	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import GridPattern from '$lib/ui/patterns/GridPattern.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicSoonBadge from '$lib/ui/components/PublicSoonBadge.svelte';

	type Props = {
		channelsVm: PublicChannelSiblingGridItem[];
		activeChannelSlug?: string | null;
		activePlatformLabel?: string;
		/** When set, section and card copy reference the agent host or MCP client. */
		agentLabel?: string | null;
	};

	let {
		channelsVm,
		activeChannelSlug = null,
		activePlatformLabel = '',
		agentLabel = null
	}: Props = $props();

	const headingId = 'public-channel-sibling-grid-heading';

	const sectionTitle = $derived(
		agentLabel?.trim()
			? activePlatformLabel.trim()
				? buildPublicAgentChannelSiblingGridTitle(activePlatformLabel, agentLabel)
				: buildPublicAgentChannelSiblingGridHubTitle(agentLabel)
			: buildPublicChannelSiblingGridTitle(activePlatformLabel)
	);
	const resolvedAgentLabel = $derived(agentLabel?.trim() ?? '');

	const sectionDescription = $derived(
		resolvedAgentLabel
			? activePlatformLabel.trim()
				? buildPublicAgentChannelSiblingGridDescription(activePlatformLabel, resolvedAgentLabel)
				: buildPublicAgentChannelSiblingGridHubDescription(resolvedAgentLabel)
			: buildPublicChannelSiblingGridDescription(activePlatformLabel)
	);

	function cardDescription(platformLabel: string, available: boolean): string {
		if (agentLabel?.trim()) {
			return buildPublicAgentChannelSiblingGridCardDescription(
				platformLabel,
				agentLabel,
				available
			);
		}
		return buildPublicChannelSiblingGridCardDescription(platformLabel, available);
	}
</script>

<section
	class="relative isolate overflow-hidden bg-base-100 py-16 sm:py-20"
	aria-labelledby={headingId}
>
	<div class="container mx-auto px-4">
		<FeaturesSectionHeader
			heroTheme={landingHeroTheme}
			{headingId}
			title={sectionTitle}
			description={sectionDescription}
		/>

		<div
			class="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 shadow-sm"
		>
			<div class="pointer-events-none absolute inset-0" aria-hidden="true">
				<GridPattern
					width={24}
					height={24}
					x="0"
					y="0"
					class="absolute inset-0 h-full w-full fill-base-content/[0.03] stroke-base-content/10"
				/>
			</div>

			<ul
				class="relative grid grid-cols-1 divide-y divide-base-content/10 sm:grid-cols-2 sm:divide-x lg:grid-cols-3"
				aria-label="Supported social channels"
			>
				{#each channelsVm as channelVm (channelVm.slug)}
					{@const isActive = activeChannelSlug === channelVm.slug}
					{@const href = url(channelVm.href)}
					<li class="min-h-[9.5rem]">
						<a
							{href}
							aria-current={isActive ? 'page' : undefined}
							class="group relative flex h-full flex-col gap-3 p-5 transition sm:p-6 {isActive
								? 'bg-primary/8 hover:bg-primary/10'
								: channelVm.available
									? 'bg-base-100/80 hover:bg-base-200/50'
									: 'bg-base-100/60 hover:bg-base-200/40'}"
						>
							<div class="flex items-start justify-between gap-3">
								<span
									class="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-base-100/90 shadow-sm"
									aria-hidden="true"
								>
									<AbstractIcon
										name={channelVm.icon}
										width="20"
										height="20"
										class="size-5 {channelVm.available ? '' : 'opacity-70'}"
										focusable="false"
									/>
								</span>
								<div class="flex shrink-0 items-start gap-2">
									{#if isActive}
										<span
											class="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary"
										>
											You're here
										</span>
									{:else if !channelVm.available}
										<PublicSoonBadge label="Soon" />
									{/if}
								</div>
							</div>

							<span class="space-y-1 text-left">
								<span
									class="block text-base font-bold text-base-content group-hover:text-primary {channelVm.available
										? ''
										: 'text-base-content/85'}"
								>
									{channelVm.platformLabel}
								</span>
								<span class="block text-sm leading-relaxed text-base-content/65">
									{cardDescription(channelVm.platformLabel, channelVm.available)}
								</span>
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
