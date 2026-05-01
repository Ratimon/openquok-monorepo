<script lang="ts">
	import type { PageData } from './$types';
	import { icons } from '$data/icons';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SectionTitle from '$lib/ui/layouts/SectionTitle.svelte';
	import SectionDescription from '$lib/ui/layouts/SectionDescription.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SectionHeaderContainer from '$lib/ui/layouts/SectionHeaderContainer.svelte';

	type Props = {
		data: PageData;
	} & PageData;

	let { data }: Props = $props();
	let {
		companyName,
		companyUrl,
		supportEmail,
		responsiblePerson
	} = $derived(data);
</script>

<SectionOuterContainer>
	<div
		class="mx-auto max-w-4xl rounded-box border border-base-300 bg-base-100 p-6 shadow-sm md:p-8 lg:p-10"
	>
		<SectionHeaderContainer>
			<Button href="/" variant="ghost" class="w-fit">
				<AbstractIcon name={icons.ChevronLeft2.name} width="20" height="20" class="mr-2" />
				Back
			</Button>
			<SectionTitle>Cookie Policy</SectionTitle>
			<SectionDescription>Last updated Mar 11, 2025</SectionDescription>
		</SectionHeaderContainer>
		<SubSectionOuterContainer class="max-w-3xl !py-4">
			<SubSectionInnerContainer
				class="prose max-w-none items-start text-justify text-base-content prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-base-content prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-xl prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base-content/90 prose-strong:text-base-content prose-a:text-primary prose-li:marker:text-base-content/60"
			>
			<p>
				At {companyName}, we believe in transparency regarding our use of cookies and similar
				tracking technologies on our website at {companyUrl}. This policy outlines our
				practices concerning these technologies and your ability to manage them.
			</p>

			<h2>
				Understanding Cookies</h2>
			<p>
				Cookies are small data files stored on your device when you browse our website. They
				help websites function properly and provide a better experience. We use first-party
				cookies (set by us) and may use third-party cookies (set by services we integrate).
			</p>

			<h2>
				How We Use Cookies</h2>
			<p>
				We use cookies for essential functionality, to personalize your experience, and to
				analyze usage. Essential cookies are necessary for the site to work and cannot be
				disabled.
			</p>

			<h2>
				Managing Cookies</h2>
			<p>
				You can control cookies through your browser settings. Disabling non-essential
				cookies may limit some features. For questions about our cookie practices, contact
				us at {supportEmail}.
			</p>

			<h2>
				Policy Updates</h2>
			<p>
				We may update this Cookie Policy from time to time. The date at the top indicates
				when it was last updated.
			</p>

			<h2>
				Contact</h2>
			<p>
				For questions about this Cookie Policy, contact us at {supportEmail} or reach
				{responsiblePerson} by mail.
			</p>
		</SubSectionInnerContainer>
		</SubSectionOuterContainer>
	</div>
</SectionOuterContainer>
