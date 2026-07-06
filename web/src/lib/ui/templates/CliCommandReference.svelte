<script lang="ts">
	import type { OpenquokCliCommandReferenceItem } from '$lib/content/constants/openquokCliCommandReference';

	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import TerminalCommandRow from '$lib/ui/templates/device-mocks/terminal/TerminalCommandRow.svelte';

	type LandingHeroTheme = {
		subtitleClass?: string;
		parseLandingHeroTitlePartSegments: (text: string) => { text: string; highlight: boolean }[];
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		landingSubtitle: string;
		landingTitle: string;
		landingDescription?: string;
		commands: readonly OpenquokCliCommandReferenceItem[];
		sectionClass?: string;
	};

	let {
		heroTheme,
		landingSubtitle,
		landingTitle,
		landingDescription = '',
		commands,
		sectionClass = 'bg-base-100 py-16 sm:py-20'
	}: Props = $props();

	const headingId = 'cli-command-reference-heading';
</script>

<section class={sectionClass} aria-labelledby={headingId}>
	<div class="container mx-auto space-y-10 px-4 sm:space-y-12">
		<FeaturesSectionHeader
			{heroTheme}
			{headingId}
			title={landingTitle}
			description={landingDescription}
			subtitle={landingSubtitle}
		/>

		<div
			class="border-base-content/10 mx-auto max-w-5xl overflow-hidden rounded-xl border bg-base-200/40 shadow-sm"
		>
			<div
				class="border-base-content/10 text-base-content/60 hidden border-b px-4 py-3 text-xs font-semibold tracking-wide uppercase sm:grid sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:gap-6 sm:px-6"
			>
				<span>Command</span>
				<span>Description</span>
			</div>

			<ul class="divide-base-content/10 divide-y">
				{#each commands as item (item.command)}
					<li
						class="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:items-center sm:gap-6 sm:px-6"
					>
						<TerminalCommandRow
							code={item.command}
							ariaLabel={`Copy ${item.command} to clipboard`}
						/>
						<p class="text-base-content/75 text-sm leading-relaxed sm:text-[15px]">
							{item.description}
						</p>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
