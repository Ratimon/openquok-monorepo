<script lang="ts">
	import { icons } from '$data/icons';

	import {
		DIRECTORY_LAUNCH_MCP_SKILL_INSTALL_OPTIONS,
		MCP_SKILL_INSTALL_OPTIONS
	} from '$lib/content/constants/agents/cli-command-reference';
	import { ONBOARDING_INLINE_TERMINAL_CODE_CLASS } from '$lib/ui/components/onboarding/onboardingConstants';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import SkillInstallCommandTabs from '$lib/ui/templates/landing-page/SkillInstallCommandTabs.svelte';

	export type PublicMcpSkillSetupVariant = 'default' | 'directory';

	type Props = {
		agentLabel: string;
		variant?: PublicMcpSkillSetupVariant;
	};

	let { agentLabel, variant = 'default' }: Props = $props();

	const skillSteps = $derived(
		variant === 'directory'
			? [
					`Install openquok-core, then openquok-directory-launch with npx skills add`,
					`${agentLabel} reads each SKILL.md — core for auth and shell safety, directory-launch for directory:* recipes`,
					`Prefer the MCP tab for hosted directory* tools with an opo_ token when you do not need the CLI`
				]
			: [
					`Install openquok-core globally with npx skills add`,
					`${agentLabel} reads SKILL.md to discover available commands`
				]
	);
</script>

<div class="space-y-4 rounded-2xl border border-base-content/10 bg-base-200/40 p-5 sm:p-6">
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

	{#if variant === 'directory'}
		<div class="space-y-2">
			<p class="text-sm font-medium text-base-content/80">
				Then install <code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>openquok-directory-launch</code>
				skill
			</p>
			<SkillInstallCommandTabs options={DIRECTORY_LAUNCH_MCP_SKILL_INSTALL_OPTIONS} />
		</div>
	{/if}
</div>
