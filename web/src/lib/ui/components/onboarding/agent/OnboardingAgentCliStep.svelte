<script lang="ts">
	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import { getRootPathAccount } from '$lib/area-protected';
	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import { buildAccountSettingsSearchParams } from '$lib/settings/utils/buildAccountSettingsSearch';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route, url } from '$lib/utils/path';

	import {
		INSTALL_AGENT_SKILL_COMMAND,
		INSTALL_CLI_COMMAND,
		ONBOARDING_INLINE_TERMINAL_CODE_CLASS
	} from '$lib/ui/components/onboarding/onboardingConstants';
	import DevelopersAccessBadges from '$lib/ui/components/onboarding/DevelopersAccessBadges.svelte';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CopyBlock from '$lib/ui/components/CopyBlock.svelte';

	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);
	const rootPathPublicDocs = getRootPathPublicDocs();
	const publicDocsPath = route(rootPathPublicDocs);

	const cliDocsHref = $derived(
		hostedMarketingHref(`${publicDocsPath}/getting-started-for-cli`, page.url.origin)
	);
	const cliAuthDocsHref = $derived(
		hostedMarketingHref(`${publicDocsPath}/getting-started-for-cli/authentication`, page.url.origin)
	);
	const openclawDocsHref = $derived(
		hostedMarketingHref(`${publicDocsPath}/agent-setup-guides/openclaw`, page.url.origin)
	);
	const hermesDocsHref = $derived(
		hostedMarketingHref(`${publicDocsPath}/agent-setup-guides/hermes`, page.url.origin)
	);
	const grokBotDocsHref = $derived(
		hostedMarketingHref(`${publicDocsPath}/agent-setup-guides/grok-bot`, page.url.origin)
	);
	const apiKeySettingsHref = url(
		`${accountPath}/settings?${buildAccountSettingsSearchParams('developers')}`
	);
</script>

<div class="px-6 py-6">
	<h3 class="text-lg font-semibold text-base-content">Automate with the CLI and your agent</h3>

	<ol class="mt-5 space-y-4 text-sm text-base-content/80">
		<li class="flex gap-3">
			<span
				class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
				aria-hidden="true"
			>1</span>
			<div class="min-w-0 flex-1 space-y-2">
				<p class="font-medium text-base-content">Install the CLI</p>
				<CopyBlock
					text={INSTALL_CLI_COMMAND}
					boxClass="w-full cursor-pointer overflow-x-auto rounded-lg border p-3 pr-14 font-mono text-xs text-left"
					background="border-base-300 bg-base-200/80"
					copiedBackground="border-success/50 bg-success/10"
					class="text-base-content whitespace-nowrap"
					copiedColor="text-success"
				/>
			</div>
		</li>
		<li class="flex gap-3">
			<span
				class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
				aria-hidden="true"
			>2</span>
			<div class="min-w-0 flex-1 space-y-2">
				<p class="font-medium text-base-content">Authenticate (2 options)</p>
				<p>
					<strong class="font-medium text-base-content">OAuth2 (suggested)</strong> — run
					<code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>openquok auth:login</code>
					for device-flow login. Credentials are stored at
					<code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>~/.openquok/credentials.json</code>.
				</p>
				<p class="inline-flex flex-wrap items-center gap-1">
					<strong class="font-medium text-base-content">Programmatic token</strong> — for CI and scripts,
					rotate an
					<code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>opo_…</code>
					token from <DevelopersAccessBadges />, then run
					<code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>openquok auth:login --apiKey "opo_…"</code>.
				</p>
			</div>
		</li>
		<li class="flex gap-3">
			<span
				class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
				aria-hidden="true"
			>3</span>
			<div class="min-w-0 flex-1 space-y-2">
				<p class="font-medium text-base-content">Set up your AI agent</p>
				<p>
					Install the
					<code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>openquok-core</code>
					skill for your agent that supports project skills (e.g. OpenClaw, Hermes, Grok Bot, and others). The skill
					teaches Openquok CLI usage; run the install command below:
				</p>
				<CopyBlock
					text={INSTALL_AGENT_SKILL_COMMAND}
					boxClass="w-full cursor-pointer overflow-x-auto rounded-lg border p-3 pr-14 font-mono text-xs text-left"
					background="border-base-300 bg-base-200/80"
					copiedBackground="border-success/50 bg-success/10"
					class="text-base-content whitespace-nowrap"
					copiedColor="text-success"
				/>
			</div>
		</li>
	</ol>

	<div class="mt-6 flex flex-wrap gap-2">
		<Button
			variant="outline"
			size="sm"
			class="gap-1.5"
			href={cliDocsHref}
			target="_blank"
			rel="noopener noreferrer"
		>
			<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
			CLI documentation
		</Button>
		<Button
			variant="outline"
			size="sm"
			class="gap-1.5"
			href={cliAuthDocsHref}
			target="_blank"
			rel="noopener noreferrer"
		>
			<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
			Authentication guide
		</Button>
		<Button
			variant="outline"
			size="sm"
			class="gap-1.5"
			href={openclawDocsHref}
			target="_blank"
			rel="noopener noreferrer"
		>
			<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
			OpenClaw guide
		</Button>
		<Button
			variant="outline"
			size="sm"
			class="gap-1.5"
			href={hermesDocsHref}
			target="_blank"
			rel="noopener noreferrer"
		>
			<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
			Hermes guide
		</Button>
		<Button
			variant="outline"
			size="sm"
			class="gap-1.5"
			href={grokBotDocsHref}
			target="_blank"
			rel="noopener noreferrer"
		>
			<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
			Grok Bot guide
		</Button>
		<Button variant="primary" size="sm" href={apiKeySettingsHref}>Get programmatic token</Button>
	</div>
</div>
