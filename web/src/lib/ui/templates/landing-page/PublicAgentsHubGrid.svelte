<script lang="ts">
	import {
		PUBLIC_AGENTS_HUB,
		type PublicAgentHostLandingPageViewModel
	} from '$lib/content/constants/publicAgentConfig';
	import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
	import { route } from '$lib/utils/path';

	import {
		INSTALL_AGENT_SKILL_COMMAND,
		INSTALL_CLI_COMMAND
	} from '$lib/ui/components/onboarding/onboardingConstants';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	type Props = {
		agentsVm: PublicAgentHostLandingPageViewModel[];
	};

	let { agentsVm }: Props = $props();

	const headingId = 'public-agents-hub-heading';
	const cliInstallHeadingId = 'public-agents-hub-cli-install-heading';
	const skillInstallHeadingId = 'public-agents-hub-skill-install-heading';
</script>

<section class="py-10 md:py-14" aria-labelledby={headingId}>
	<div class="mx-auto max-w-3xl space-y-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">
			{PUBLIC_AGENTS_HUB.subtitle}
		</p>
		<h1
			id={headingId}
			class="text-3xl font-black tracking-tight text-balance text-base-content sm:text-4xl"
		>
			{PUBLIC_AGENTS_HUB.title}
		</h1>
		<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{PUBLIC_AGENTS_HUB.description}
		</p>
	</div>

	<div class="mx-auto mt-10 w-full max-w-4xl space-y-6">
		<section class="space-y-3" aria-labelledby={cliInstallHeadingId}>
			<h2
				id={cliInstallHeadingId}
				class="text-center text-sm font-semibold tracking-tight text-base-content/75 sm:text-base"
			>
				{PUBLIC_AGENTS_HUB.cliInstallTitle}
			</h2>
			<TerminalCommandMock
				code={INSTALL_CLI_COMMAND}
				ariaLabel="Copy OpenQuok CLI install command to clipboard"
				class="[&>div]:text-sm sm:[&>div]:text-base"
			/>
		</section>

		<section class="space-y-3" aria-labelledby={skillInstallHeadingId}>
			<h2
				id={skillInstallHeadingId}
				class="text-center text-sm font-semibold tracking-tight text-base-content/75 sm:text-base"
			>
				{PUBLIC_AGENTS_HUB.skillInstallTitle}
			</h2>
			<TerminalCommandMock
				code={INSTALL_AGENT_SKILL_COMMAND}
				ariaLabel="Copy openquok-core skill install command to clipboard"
				class="[&>div]:text-sm sm:[&>div]:text-base"
			/>
		</section>
	</div>

	<ul
		class="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
		aria-label="AI agent hosts and integrations you can connect"
	>
		{#each agentsVm as agent (agent.slug)}
			{@const href = agent.available ? route(getRootPathPublicAgent(agent.slug)) : undefined}
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
									name={agent.icon}
									width="28"
									height="28"
									class="size-7"
									focusable="false"
								/>
							</span>
						</div>
						<div class="space-y-2 text-left">
							<h2 class="text-lg font-bold text-base-content group-hover:text-primary">
								{agent.agentLabel}
							</h2>
							<p class="text-sm leading-relaxed text-base-content/70">
								{agent.hubDescription ?? agent.metaDescription}
							</p>
						</div>
						<span class="mt-auto text-sm font-semibold text-primary">View integration →</span>
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
									name={agent.icon}
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
							<h2 class="text-lg font-bold text-base-content/80">{agent.agentLabel}</h2>
							<p class="text-sm leading-relaxed text-base-content/60">
								{agent.hubDescription ?? agent.metaDescription}
							</p>
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</section>
