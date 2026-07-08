<script lang="ts">
	import type { PageData } from './$types';

	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let hubVm = $derived(data.hubVm);
	let schemaData = $derived(data.schemaData);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">
			{hubVm.eyebrow}
		</p>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
			{hubVm.title}
		</h1>
		<p class="mx-auto max-w-2xl text-base text-base-content/70">
			{hubVm.description}
		</p>
	</header>

	<section class="container mx-auto mt-10 max-w-4xl px-4">
		<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each hubVm.pairs as pair (pair.slug)}
				<li>
					<a
						class="flex h-full items-center justify-between rounded-2xl border border-base-content/10 p-6 transition hover:border-primary/40 hover:shadow-md"
						href={pair.href}
					>
						<h2 class="text-xl font-semibold text-base-content">
							vs {pair.name}
						</h2>
						<span class="text-sm font-medium text-primary" aria-hidden="true">→</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<div class="container mx-auto px-4">
		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
