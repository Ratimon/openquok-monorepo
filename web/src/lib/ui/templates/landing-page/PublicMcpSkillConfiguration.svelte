<script lang="ts">
	import { icons } from '$data/icons';

	import {
		MCP_SKILL_INSTALL_OPTIONS,
		// OPENQUOK_CORE_SKILL_AUTH_SNIPPET
	} from '$lib/content/constants/openquokCliCommandReference';
	import { ONBOARDING_INLINE_TERMINAL_CODE_CLASS } from '$lib/ui/components/onboarding/onboardingConstants';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import SkillInstallCommandTabs from '$lib/ui/templates/landing-page/SkillInstallCommandTabs.svelte';
	// import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	type Props = {
		agentLabel: string;
	};

	let { agentLabel }: Props = $props();

	const skillSteps = $derived([
		`Install openquok-core globally with npx skills add`,
		`${agentLabel} reads SKILL.md to discover available commands`
		// 'Set OPENQUOK_API_KEY as an environment variable',
		// 'Commands run in a sandboxed environment for safety',
		// 'Run OpenQuok tasks in parallel with your coding workflows'
	]);
</script>

<div class="space-y-4 rounded-2xl border border-base-content/10 bg-base-200/40 p-5 sm:p-6">
	<!-- <p class="text-sm leading-relaxed text-pretty text-base-content/70 sm:text-base">
		{agentLabel} discovers OpenQuok through the <code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}
			>openquok-core</code
		> SKILL.md file in your project. Once it reads the skill definition, it can execute OpenQuok
		commands in a sandboxed environment — safely and autonomously.
	</p> -->

	<ul class="space-y-2.5" aria-label="How OpenQuok skills work with {agentLabel}">
		{#each skillSteps as step (step)}
			<li class="flex items-start gap-2.5 text-sm text-base-content/80">
				<span
					class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
					aria-hidden="true"
				>
					<AbstractIcon name={icons.Check.name} class="size-3" width="12" height="12" />
				</span>
				<span>{step}</span>
			</li>
		{/each}
	</ul>

	<div class="space-y-2">
		<p class="text-sm font-medium text-base-content/80">
			Install <code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>openquok-core</code> skill
		</p>
		<SkillInstallCommandTabs options={MCP_SKILL_INSTALL_OPTIONS} />
	</div>

	<!-- <div class="space-y-2">
		<p class="text-sm font-medium text-base-content/80">Authenticate the CLI</p>
		<TerminalCommandMock
			code={OPENQUOK_CORE_SKILL_AUTH_SNIPPET}
			ariaLabel="Copy openquok-core CLI authentication commands to clipboard"
			class="[&>div]:text-sm sm:[&>div]:text-base"
		/>
	</div> -->
</div>
