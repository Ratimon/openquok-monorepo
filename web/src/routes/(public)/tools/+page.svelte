<script lang="ts">
	import type { PageData } from './$types';

	import { getRootPathPublicAgentBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { route, url } from '$lib/utils/path';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let tools = $derived(data.toolsVm);
	let schemaData = $derived(data.schemaData);

	// /tools/agent-builder
	const rootPathPublicAgentBuilder = getRootPathPublicAgentBuilder();
	const agentBuilderHref = url(route(rootPathPublicAgentBuilder));
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
			{#each tools as tool (tool.id)}
				<li>
					<a
						class="block h-full rounded-2xl border border-base-content/10 p-6 transition hover:border-primary/40 hover:shadow-md"
						href={tool.href}
					>
						{#if tool.badge}
							<span class="badge badge-primary badge-outline badge-sm">{tool.badge}</span>
						{/if}
						<h2 class="mt-2 text-xl font-semibold text-base-content">{tool.title}</h2>
						<p class="mt-2 text-sm text-base-content/70">{tool.description}</p>
						<p class="mt-4 text-sm font-medium text-primary">Open tool →</p>
					</a>
				</li>
			{/each}
		</ul>

		<p class="mt-8 text-center text-sm text-base-content/60">
			Start with the
			<a class="link link-primary" href={agentBuilderHref}>Agent Builder</a>
			to compose CLI and MCP workflows from the Extensions catalog.
		</p>
	</section>
</SectionOuterContainer>
