<script lang="ts">
	import type { PageData } from './$types';
	import { icons } from '$data/icon';
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
	let { companyName, supportEmail } = $derived(data);
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
			<SectionTitle>Privacy Policy for {companyName}</SectionTitle>
			<SectionDescription>Last updated Mar 11, 2025</SectionDescription>
		</SectionHeaderContainer>
		<SubSectionOuterContainer class="max-w-3xl !py-4">
			<SubSectionInnerContainer
				class="prose max-w-none items-start text-justify text-base-content prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-base-content prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-xl prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base-content/90 prose-strong:text-base-content prose-a:text-primary prose-li:marker:text-base-content/60"
			>
			<p>
				Welcome to {companyName}. We are committed to protecting your privacy and ensuring
				transparency in how we collect, use, and safeguard your personal information.
			</p>

			<h2>
				1. Information We Collect</h2>
			<p>
				We collect information you provide directly (e.g. account details, communications)
				and information we collect automatically (e.g. usage data, device information,
				cookies). See our <a href="/cookie-policy" class="link link-hover">Cookie Policy</a> for
				details on cookies.
			</p>

			<h2>
				2. How We Use Your Information</h2>
			<p>
				We use the information to provide and improve our services, manage your account,
				communicate with you, and comply with legal obligations.
			</p>

			<h2>
				3. Information Sharing</h2>
			<p>
				We may share information with service providers who assist our operations. We may
				disclose information when required by law or to protect our rights and safety.
			</p>

			<h2>
				4. Data Security and Retention</h2>
			<p>
				We implement appropriate measures to protect your data. We retain your information
				for as long as necessary to provide our services and fulfill the purposes described
				in this policy.
			</p>

			<h2>
				5. Your Rights</h2>
			<p>
				You may have rights to access, correct, or delete your personal information, and to
				object to or restrict certain processing. Contact us to exercise these rights.
			</p>

			<h2>
				6. Changes</h2>
			<p>
				We may update this Privacy Policy from time to time. We will notify you of material
				changes by posting the updated policy on our website.
			</p>

			<h2>
				7. Contact Us</h2>
			<p>
				If you have questions about this Privacy Policy or our data practices, please
				contact us at {supportEmail} or through our website.
			</p>
		</SubSectionInnerContainer>
		</SubSectionOuterContainer>
	</div>
</SectionOuterContainer>
