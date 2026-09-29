<script lang="ts">
	import type { AccountGettingStartedAutomationLink } from '$lib/ui/components/home/accountGettingStarted.types';

	import { page } from '$app/state';

	import { hostedMarketingAnchorAttrs } from '$lib/utils/hostedMarketingHref';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		automationLinks: AccountGettingStartedAutomationLink[];
	};

	let { automationLinks }: Props = $props();
</script>

<div>
	<h3 class="text-sm font-semibold text-base-content">Automate with MCP &amp; CLI</h3>
	<p class="mt-1 text-sm text-base-content/65">Connect agents via MCP clients or the CLI.</p>
	<ul class="mt-4 space-y-1">
		{#each automationLinks as link (link.label)}
			<li>
				{#if link.onClick}
					<button
						type="button"
						class="flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-base-200/70"
						onclick={link.onClick}
					>
						<span
							class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
						>
							<AbstractIcon name={link.iconName} class="size-4" width="16" height="16" />
						</span>
						<span class="min-w-0">
							<span class="block text-sm font-medium text-base-content">{link.label}</span>
							{#if link.description}
								<span class="mt-0.5 block text-xs text-base-content/60">{link.description}</span>
							{/if}
						</span>
					</button>
				{:else if link.href}
					{@const marketing = hostedMarketingAnchorAttrs(link.href, page.url.origin)}
					<a
						href={marketing.href}
						class="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-base-200/70"
						{...(marketing.external ? { target: marketing.target, rel: marketing.rel } : {})}
					>
						<span
							class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
						>
							<AbstractIcon name={link.iconName} class="size-4" width="16" height="16" />
						</span>
						<span class="min-w-0">
							<span class="block text-sm font-medium text-base-content">{link.label}</span>
							{#if link.description}
								<span class="mt-0.5 block text-xs text-base-content/60">{link.description}</span>
							{/if}
						</span>
					</a>
				{/if}
			</li>
		{/each}
	</ul>
</div>
