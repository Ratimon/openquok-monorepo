<script lang="ts">
	import { page } from '$app/state';
	import {
		externalLinkAnchorAttrs,
		isAbsoluteHttpHref
	} from '$lib/utils/externalLinkRel';
	import { hostedMarketingAnchorAttrs } from '$lib/utils/hostedMarketingHref';

	type Props = {
		linkList: Record<string, { label: string; href: string }[]>;
	};
	let { linkList }: Props = $props();

	function capitalize(s: string): string {
		return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
	}

	function footerAnchorAttrs(href: string) {
		const marketing = hostedMarketingAnchorAttrs(href, page.url.origin);
		if (marketing.external) {
			return {
				href: marketing.href,
				target: marketing.target,
				rel: marketing.rel,
				external: true
			};
		}
		if (isAbsoluteHttpHref(href)) {
			const external = externalLinkAnchorAttrs(href);
			return {
				href: external.href,
				target: external.target,
				rel: external.rel,
				external: true
			};
		}
		return {
			href: marketing.href,
			target: marketing.target,
			rel: marketing.rel,
			external: false
		};
	}
</script>

<div class="grid w-full grid-cols-1 gap-x-8 gap-y-10 text-left sm:grid-cols-2 xl:grid-cols-3">
	{#each Object.keys(linkList) as category (category)}
		<div class="min-w-0">
			<h3 class="text-sm font-semibold leading-6 text-base-content">
				{capitalize(category)}</h3>
			<ul role="list" class="mt-6 space-y-4">
				{#each linkList[category] as link (link.href)}
					{@const attrs = footerAnchorAttrs(link.href)}
					<li>
						<a
							href={attrs.href}
							target={attrs.target}
							rel={attrs.rel}
							class="text-sm leading-6 text-base-content/80 hover:underline"
							data-sveltekit-preload-data={attrs.external ? 'off' : 'tap'}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</div>
