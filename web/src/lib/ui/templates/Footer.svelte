<script lang="ts">
	import { url } from '$lib/utils/path';

	import InternalLinkBar from '$lib/ui/components/InternalLinkBar.svelte';
	import SocialFollowBar from '$lib/ui/social/SocialFollowBar.svelte';

	type Props = {
		footerNavigationLinks: Record<string, { label: string; href: string }[]>;
		companyNameVm: string;
		companyYearVm: string;
		companyAddressVm?: string;
		supportPhoneVm?: string;
		supportEmailVm?: string;
	};

	let {
		footerNavigationLinks,
		companyNameVm,
		companyYearVm,
		companyAddressVm = '',
		supportPhoneVm = '',
		supportEmailVm = ''
	}: Props = $props();

	let copyrightDuration = $derived(
		companyYearVm === new Date().getFullYear().toString()
			? companyYearVm
			: `${companyYearVm} - ${new Date().getFullYear().toString()}`
	);

	let trimmedAddress = $derived(companyAddressVm.trim());
	let trimmedPhone = $derived(supportPhoneVm.trim());
	let trimmedEmail = $derived(supportEmailVm.trim());
	let hasContactDetails = $derived(
		Boolean(trimmedAddress || trimmedPhone || trimmedEmail)
	);
</script>

<footer
	class="relative z-20 w-full border-t border-base-300 bg-base-200 pt-10 text-base-content"
	aria-labelledby="footer-heading"
>
	<h2 id="footer-heading" class="sr-only">
		Footer
	</h2>

	<div class="mx-auto max-w-7xl px-4 pb-8 pt-16 lg:px-12">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="space-y-8 md:col-span-1 md:pr-12">
				<img
					class="h-auto w-full sm:w-48"
					alt={companyNameVm}
					src={url('/pwa/favicon.svg')}
					width={100}
					height={100}
				/>

				{#if hasContactDetails}
					<address class="not-italic space-y-1 text-sm text-base-content/80">
						{#if trimmedAddress}
							<p class="whitespace-pre-line">{trimmedAddress}</p>
						{/if}
						{#if trimmedPhone}
							<p>
								<a class="hover:text-base-content" href="tel:{trimmedPhone.replace(/\s+/g, '')}">
									{trimmedPhone}
								</a>
							</p>
						{/if}
						{#if trimmedEmail}
							<p>
								<a class="hover:text-base-content" href="mailto:{trimmedEmail}">
									{trimmedEmail}
								</a>
							</p>
						{/if}
					</address>
				{/if}

				<div class="w-full md:w-fit">
					<SocialFollowBar
						direction="horizontal"
						size="sm"
						class="mx-auto text-sm text-base-content/80 hover:text-base-content"
					/>
				</div>
			</div>

			<div class="md:col-span-2">
				<InternalLinkBar
					linkList={footerNavigationLinks}
				/>
			</div>
		</div>

		<div class="mt-8 w-full border-t border-base-300 py-4">
			<div class="mx-auto space-y-2 text-center text-xs leading-5 text-base-content/80">
				<div class="flex-wrap whitespace-nowrap">
					&copy; {copyrightDuration}
					{companyNameVm}. All rights reserved.
				</div>
				{#if trimmedAddress || trimmedPhone}
					<div class="flex flex-col items-center gap-1 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-3">
						{#if trimmedAddress}
							<span class="whitespace-pre-line">{trimmedAddress}</span>
						{/if}
						{#if trimmedAddress && trimmedPhone}
							<span class="hidden sm:inline" aria-hidden="true">·</span>
						{/if}
						{#if trimmedPhone}
							<a class="hover:text-base-content" href="tel:{trimmedPhone.replace(/\s+/g, '')}">
								{trimmedPhone}
							</a>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</footer>
