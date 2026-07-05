<script lang="ts">
	import type { PageData } from './$types';

	import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_DOCS_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let toolsVm = $derived(data.toolsVm);
	let schemaData = $derived(data.schemaData);

	// /tools/skill-builder
	const rootPathPublicSkillBuilder = getRootPathPublicSkillBuilder();
	const skillBuilderHref = url(route(rootPathPublicSkillBuilder));

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const toolsHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.tools;
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">Free tools</p>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{metaTitle}</h1>
		<p class="mx-auto max-w-2xl text-base text-base-content/70">{metaDescription}</p>
	</header>

	<section class="container mx-auto mt-10 max-w-4xl px-4">
		<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each toolsVm as toolVm (toolVm.id)}
				<li>
					<a
						class="block h-full rounded-2xl border border-base-content/10 p-6 transition hover:border-primary/40 hover:shadow-md"
						href={toolVm.href}
					>
						{#if toolVm.badge}
							<span class="badge badge-primary badge-outline badge-sm">
								{toolVm.badge}
							</span>
						{/if}
						<h2 class="mt-2 text-xl font-semibold text-base-content">
							{toolVm.title}
						</h2>
						<p class="mt-2 text-sm text-base-content/70">
							{toolVm.description}
						</p>
						<p class="mt-4 text-sm font-medium text-primary">
							Open tool →
						</p>
					</a>
				</li>
			{/each}
		</ul>

		<p class="mt-8 text-center text-sm text-base-content/60">
			Start with the
			<a class="link link-primary" href={skillBuilderHref}>Skill Builder</a>
			to compose skills from the Extensions catalog and export SKILL.md.
		</p>
	</section>

	<div class="container mx-auto px-4">
		<AccentSplitCtaBanner
			title={toolsHubDocsBanner.title}
			description={toolsHubDocsBanner.description}
			ctaText={PUBLIC_DOCS_BANNER_CTA_TEXT}
			ctaHref={toolsHubDocsBanner.docsPath}
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
