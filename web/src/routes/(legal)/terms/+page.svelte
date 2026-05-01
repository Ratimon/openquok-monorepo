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
	let { companyName } = $derived(data);
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
			<SectionTitle>Terms and Conditions of Use for {companyName}</SectionTitle>
			<SectionDescription>Last updated Mar 11, 2025</SectionDescription>
		</SectionHeaderContainer>
		<SubSectionOuterContainer class="max-w-3xl !py-4">
			<SubSectionInnerContainer
				class="prose max-w-none items-start text-justify text-base-content prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-base-content prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-xl prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base-content/90 prose-strong:text-base-content prose-a:text-primary prose-li:marker:text-base-content/60"
			>
			<p>
				Welcome to {companyName}. By using our website and services, these Terms of Service
				(&quot;Terms&quot;) govern your access to and use of our website, services, and
				related tools (collectively, the &quot;Services&quot;). By accessing or using our
				Services, you agree to be bound by these Terms. If you do not agree, do not use the
				Services.
			</p>

			<h2>
				1. Accepting these Terms</h2>
			<p>
				These Terms form a legally binding agreement between {companyName} and the
				individual or entity accessing or using the Services (&quot;you&quot; or
				&quot;your&quot;). By accessing or using the Services, you agree to comply with and
				be bound by these Terms.
			</p>

			<h2>
				2. Services</h2>
			<p>
				{companyName} provides content and related services. We aim to deliver the Services
				with reasonable skill and care. We do not guarantee error-free or uninterrupted
				Services.
			</p>

			<h2>
				3. Use of Services</h2>
			<p>
				You agree to use the Services only for lawful purposes and in accordance with
				these Terms and applicable laws. You are responsible for securing your account and
				access credentials.
			</p>

			<h2>
				4. Intellectual Property</h2>
			<p>
				All content, data, and materials available through {companyName} remain the
				property of {companyName} and its licensors. You may not copy, modify, or
				redistribute them without permission.
			</p>

			<h2>
				5. Disclaimers</h2>
			<p>
				The Services are provided &quot;as-is&quot; without warranties of any kind. We do
				not guarantee that the Services will meet your requirements or that errors will be
				corrected.
			</p>

			<h2>
				6. Limitation of Liability</h2>
			<p>
				To the extent permitted by law, {companyName} will not be liable for any indirect,
				incidental, or consequential damages arising out of your use of the Services.
			</p>

			<h2>
				7. Changes to Terms</h2>
			<p>
				We may amend these Terms from time to time. Updated Terms will be posted on our
				website. Continued use of the Services after updates constitutes your acceptance of
				the new Terms.
			</p>

			<h2>
				8. Contact</h2>
			<p>
				If you have any questions about these Terms, please contact us through our
				website.
			</p>
		</SubSectionInnerContainer>
	</SubSectionOuterContainer>
	</div>
</SectionOuterContainer>
