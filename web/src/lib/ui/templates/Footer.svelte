<script lang="ts">
	import InternalLinkBar from '$lib/ui/components/InternalLinkBar.svelte';
	import SocialFollowBar from '$lib/ui/social/SocialFollowBar.svelte';
	import { url } from '$lib/utils/path';

	type Props = {
		footerNavigationLinks: Record<string, { label: string; href: string }[]>;
		companyNameVm: string;
		companyYearVm: string;
		marketingInformationVm?: Record<string, string> | null;
	};

	let { footerNavigationLinks, companyNameVm, companyYearVm, marketingInformationVm }: Props = $props();

	let copyrightDuration = $derived(
		companyYearVm === new Date().getFullYear().toString()
			? companyYearVm
			: `${companyYearVm} - ${new Date().getFullYear().toString()}`
	);
</script>

<footer
	class="relative z-20 w-full border-t border-base-300 bg-base-200 pt-10 text-base-content"
	aria-labelledby="footer-heading"
>
	<h2 id="footer-heading" class="sr-only">
		Footer</h2>

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

				<div class="w-full md:w-fit">
					<SocialFollowBar
						marketingInformationVm={marketingInformationVm ?? {}}
						direction="horizontal"
						size="sm"
						class="mx-auto text-sm text-base-content/80 hover:text-base-content"
					/>
				</div>
			</div>

			<div class="md:col-span-2">
				<InternalLinkBar linkList={footerNavigationLinks} />
			</div>
		</div>

		<div class="mt-8 w-full border-t border-base-300 py-4">
			<div
				class="mx-auto flex-wrap whitespace-nowrap text-center text-xs leading-5 text-base-content/80"
			>
				&copy; {copyrightDuration}
				{companyNameVm}. All rights reserved.
			</div>
		</div>
	</div>
</footer>
