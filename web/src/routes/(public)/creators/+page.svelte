<script lang="ts">
	import type { PageData } from './$types';

	import { getRootPathPublicCreator } from '$lib/area-public/constants/getRootPathPublicCreators';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';

	import * as Avatar from '$lib/ui/components/avatar';
	import SupabaseUserAvatar from '$lib/ui/supabase/SupabaseUserAvatar.svelte';
	import { Card, CardContent, CardHeader } from '$lib/ui/card';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let creators = $derived(data.creators);
	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let schemaData = $derived(data.schemaData);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const creatorsHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.creators;

	function creatorHref(username: string): string {
		return url(`/${getRootPathPublicCreator(username)}`);
	}

	function displayName(creator: (typeof creators)[number]): string {
		return creator.fullName || creator.username || 'Anonymous';
	}

	function listingSummary(creator: (typeof creators)[number]): string {
		const parts: string[] = [];
		if (creator.extensionCount > 0) {
			parts.push(
				creator.extensionCount === 1
					? '1 building block'
					: `${creator.extensionCount} building blocks`
			);
		}
		if (creator.stackCount > 0) {
			parts.push(creator.stackCount === 1 ? '1 playbook' : `${creator.stackCount} playbooks`);
		}
		return parts.join(' · ') || 'No published listings';
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="bg-base-100">
	<header class="container mx-auto max-w-6xl space-y-4 px-4 py-10 text-center md:py-14">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">Community</p>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{metaTitle}</h1>
		<p class="mx-auto max-w-3xl text-base text-base-content/70">{metaDescription}</p>
	</header>

	<section class="container mx-auto max-w-6xl px-4 pb-14">
		{#if creators.length === 0}
			<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
				No creators with a public username have published building blocks or playbooks yet.
				Publishers can set a username in account settings to appear here.
			</p>
		{:else}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each creators as creator (creator.id)}
					{#if creator.username}
						<a href={creatorHref(creator.username)} class="block">
							<Card class="h-full transition-all hover:shadow-md">
								<CardHeader class="flex flex-row items-center gap-4">
									<Avatar.Root class="size-16 shrink-0 rounded-full">
										<SupabaseUserAvatar
											url={creator.avatarUrl}
											size={64}
											alt={displayName(creator)}
											imageOnly
										/>
										<Avatar.Fallback>
											{displayName(creator).charAt(0).toUpperCase()}
										</Avatar.Fallback>
									</Avatar.Root>
									<div>
										<h2 class="text-xl font-semibold">{displayName(creator)}</h2>
										<p class="text-sm text-base-content/70">{listingSummary(creator)}</p>
									</div>
								</CardHeader>
								{#if creator.tagLine}
									<CardContent>
										<p class="text-sm text-base-content/70">{creator.tagLine}</p>
									</CardContent>
								{/if}
							</Card>
						</a>
					{/if}
				{/each}
			</div>
		{/if}
	</section>

	<div class="container mx-auto px-4">
		<AccentSplitCtaBanner
			title={creatorsHubDocsBanner.title}
			description={creatorsHubDocsBanner.description}
			ctaText={creatorsHubDocsBanner.ctaText}
			ctaHref={creatorsHubDocsBanner.docsPath}
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
