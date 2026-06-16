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
	let { companyName, companyUrl, legalName, companyAddress, supportEmail } = $derived(data);

	let supportContactHref = $derived(
		supportEmail.includes('@') ? `mailto:${supportEmail}` : supportEmail
	);
	let trimmedLegalName = $derived(legalName.trim());
	let trimmedCompanyAddress = $derived(companyAddress.trim());
	let showLegalNameInContact = $derived(
		Boolean(trimmedLegalName) && trimmedLegalName !== companyName
	);
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
			<SectionDescription>Last updated June 16, 2026</SectionDescription>
		</SectionHeaderContainer>
		<SubSectionOuterContainer class="max-w-3xl !py-4">
			<SubSectionInnerContainer
				class="prose max-w-none items-start text-justify text-base-content prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-base-content prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-xl prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-lg prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base-content/90 prose-strong:text-base-content prose-a:text-primary prose-li:marker:text-base-content/60"
			>
				<p>
					Welcome to {companyName}. These Terms of Service (<strong>“Terms”</strong>) govern your
					access to and use of our websites, applications, APIs, command-line tools, and related
					services for planning, scheduling, publishing, and analysing social and messaging content
					(collectively, the <strong>“Services”</strong>), available at
					<a href={companyUrl} class="link link-hover">{companyUrl}</a> and related sub-domains. By
					creating an account, connecting a channel, or otherwise using the Services, you agree to
					these Terms. If you do not agree, do not use the Services.
				</p>
				<p>
					Our
					<a href="/privacy-policy" class="link link-hover">Privacy Policy</a>
					explains how we handle personal information and is incorporated into these Terms by reference.
				</p>

				<h2>1. Who we are</h2>
				<p>
					{#if showLegalNameInContact}
						The Services are provided by <strong>{trimmedLegalName}</strong> (trading as
						<strong>{companyName}</strong>)
					{:else}
						The Services are provided by <strong>{companyName}</strong>
					{/if}
					(“we”, “us”, “our”). References to {companyName} in these Terms mean the entity operating
					the Services unless we state otherwise.
				</p>

				<h2>2. Eligibility and accounts</h2>
				<p>
					You must be at least 18 years old, or the age of majority in your jurisdiction, and able to
					enter a binding contract to use the Services. If you use the Services on behalf of an
					organization, you represent that you have authority to bind that organization, and
					<strong>“you”</strong> means both you individually and that organization.
				</p>
				<p>
					You are responsible for keeping your account credentials confidential, for all activity under
					your account, and for keeping your account information accurate. Notify us promptly at
					<a href={supportContactHref} class="link link-hover">{supportEmail}</a>
					if you suspect unauthorized access.
				</p>

				<h2>3. The Services</h2>
				<p>
					{companyName} provides tools to connect social and messaging channels, compose and schedule
					content, collaborate in workspaces, review drafts (including via calendar and kanban views),
					publish through official platform APIs where supported, and view analytics returned by those
					platforms. We may also offer automation features, including agent or CLI integrations that
					create or update drafts in your workspace.
				</p>
				<p>
					Specific channels, features, limits, and integrations depend on your plan, configuration,
					and the platforms you connect. We may add, change, suspend, or discontinue any part of the
					Services at any time, including where a third-party platform changes or revokes API access.
					Where a change materially and adversely affects a paid subscription, we will use
					commercially reasonable efforts to give advance notice.
				</p>

				<h2>4. Subscriptions, fees, and billing</h2>
				<p>
					Paid plans, where offered, are billed on the cycle you select (for example monthly or
					annual) through our payment processor (such as Stripe). By subscribing, you authorize us and
					our processor to charge applicable fees to your chosen payment method. Subscriptions renew
					automatically at the then-current rate unless you cancel before renewal.
				</p>
				<p>
					Except where required by applicable law or expressly stated in a written refund policy on
					our site, fees are non-refundable, including for partially used periods. Cancelling stops
					future renewals; it does not entitle you to a pro-rata refund of the current period. Fees
					are exclusive of taxes, duties, and similar charges, which are your responsibility where
					applicable.
				</p>
				<p>
					We may change pricing for new billing periods on reasonable advance notice (for example by
					email or in-product notice). Continued use of a paid plan after a price change takes effect
					constitutes acceptance of the new price for subsequent periods.
				</p>

				<h2>5. Free plans, trials, and beta features</h2>
				<p>
					We may offer free tiers, trials, or features labelled beta, preview, or similar. They are
					provided <strong>“as is”</strong>, may have additional limits, and may change or end at any
					time. We make no warranties regarding free or beta features.
				</p>

				<h2>6. Your content</h2>
				<p>
					<strong>“Your Content”</strong> means text, images, video, audio, links, metadata,
					schedules, captions, prompts, settings, and other materials you upload, generate within, or
					transmit through the Services.
				</p>
				<p>
					As between you and {companyName}, you retain ownership of Your Content. You grant us a
					worldwide, non-exclusive, royalty-free licence to host, store, reproduce, transmit,
					display, adapt, and distribute Your Content solely to operate, secure, and improve the
					Services—including publishing to platforms you connect and generating previews, analytics,
					and related outputs.
				</p>
				<p>
					You represent that you have all rights and permissions needed for Your Content and its
					publication; that Your Content complies with these Terms, applicable law, and each
					connected platform’s rules; and that Your Content does not infringe third-party rights.
				</p>

				<h2>7. Acceptable use</h2>
				<p>You agree not to use the Services to, and not to permit others to:</p>
				<ul>
					<li>
						publish or store unlawful, defamatory, harassing, hateful, threatening, or sexually
						exploitative content, or content that infringes intellectual-property, privacy, or
						publicity rights;
					</li>
					<li>
						send spam, run undisclosed bots, create fake engagement, or otherwise violate the rules
						of any connected platform;
					</li>
					<li>
						circumvent rate limits, technical restrictions, or access controls of the Services or
						any connected platform;
					</li>
					<li>
						reverse engineer or scrape the Services except where applicable law expressly permits;
					</li>
					<li>
						resell, sublicense, or white-label the Services except under a written agreement with us;
					</li>
					<li>
						upload malware, attempt unauthorized access, or interfere with the integrity or
						performance of the Services or its infrastructure.
					</li>
				</ul>
				<p>
					We may suspend or terminate access for violations, with or without notice, and may remove
					offending content. We may report violations to affected platforms where required or
					appropriate.
				</p>

				<h2>8. Third-party platforms and integrations</h2>
				<p>
					A core function of the Services is to publish Your Content to third-party social and
					messaging platforms you connect (for example Facebook, Instagram, Threads, and YouTube,
					where available). You authenticate those accounts and authorize us to act on your behalf
					within the scopes you grant.
				</p>
				<p>
					Your use of each platform through the Services is also governed by that platform’s terms and
					privacy policy. Examples include:
				</p>
				<ul>
					<li>
						<strong>YouTube</strong> — by connecting YouTube you agree to the
						<a
							href="https://www.youtube.com/t/terms"
							class="link link-hover"
							rel="noopener noreferrer"
							target="_blank"
						>
							YouTube Terms of Service
						</a>
						and acknowledge the
						<a
							href="https://policies.google.com/privacy"
							class="link link-hover"
							rel="noopener noreferrer"
							target="_blank"
						>
							Google Privacy Policy
						</a>. {companyName} uses YouTube API Services. See our
						<a href="/privacy-policy#google-api-services" class="link link-hover">Privacy Policy</a>
						for how we handle Google user data.
					</li>
					<li>
						<strong>Meta platforms</strong> (Facebook, Instagram, Threads) — Meta’s terms and platform
						policies apply to content published through those APIs.
					</li>
				</ul>
				<p>
					You may revoke our access at any time by disconnecting a channel in your workspace
					integrations settings or through that platform’s permissions or security settings (for
					example
					<a
						href="https://security.google.com/settings/security/permissions"
						class="link link-hover"
						rel="noopener noreferrer"
						target="_blank"
					>
						Google security settings
					</a>
					for YouTube). Revoking access stops future scheduled publishing to that platform.
				</p>
				<p>
					We are not responsible for a third-party platform’s availability, moderation, account
					suspensions, rate limits, policy changes, or API changes. If a platform changes or ends API
					access in a way that affects the Services, we may modify or discontinue the affected
					integration without liability to you.
				</p>

				<h2>9. AI, agents, and automation</h2>
				<p>
					The Services may offer AI-assisted drafting, agent or CLI workflows, or other automation
					that creates or updates content in your workspace (<strong>“Automated Output”</strong>).
					Automated Output may be inaccurate or unsuitable. You are solely responsible for reviewing
					Automated Output before publishing, ensuring compliance with law and platform rules, and
					obtaining any required consents or disclosures.
				</p>
				<p>
					Nothing in the Services publishes to connected platforms without the workflow and approvals
					you configure. We do not use information received from Google APIs to train generalized
					machine-learning or AI models, as described in our Privacy Policy.
				</p>

				<h2>10. Intellectual property</h2>
				<p>
					The Services and all software, designs, text, graphics, logos, and other materials we
					provide (excluding Your Content and components under separate open-source licences) are
					owned by {companyName} or its licensors. Subject to your compliance with these Terms, we
					grant you a limited, non-exclusive, non-transferable, revocable licence to access and use
					the Services for their intended purpose while your account is active.
				</p>

				<h2>11. Feedback</h2>
				<p>
					If you provide feedback or suggestions about the Services, you grant us a perpetual,
					irrevocable, worldwide, royalty-free licence to use them without obligation or compensation
					to you.
				</p>

				<h2>12. Privacy and data protection</h2>
				<p>
					Our processing of personal data is described in our
					<a href="/privacy-policy" class="link link-hover">Privacy Policy</a>. Where we process
					personal data about your audience or contacts on your instructions through connected
					platforms, we generally act as a processor and you act as controller; contact us at
					<a href={supportContactHref} class="link link-hover">{supportEmail}</a>
					to request our standard data processing addendum where available.
				</p>

				<h2>13. Suspension and termination</h2>
				<p>
					You may stop using the Services and close your account through available account settings or
					by contacting us. We may suspend or terminate access immediately if you breach these Terms,
					fail to pay fees when due, use the Services in a way that exposes us or a platform to legal,
					security, or reputational risk, or where required by law.
				</p>
				<p>
					On termination your right to access the Services ends. We may delete Your Content and
					account data after the retention periods in our Privacy Policy. Sections that by nature
					should survive (including Your Content licence, fees accrued, disclaimers, limitation of
					liability, indemnification, and governing law) survive termination.
				</p>

				<h2>14. Disclaimers</h2>
				<p>
					To the maximum extent permitted by law, the Services are provided <strong
						>“as is”</strong
					>
					and <strong>“as available”</strong>, without warranties of any kind, whether express, implied,
					or statutory, including merchantability, fitness for a particular purpose, non-infringement,
					or uninterrupted or error-free operation. We do not warrant that scheduled posts will always
					be delivered on time, that platforms will accept them, or that third-party analytics will be
					complete or accurate.
				</p>

				<h2>15. Limitation of liability</h2>
				<p>
					To the maximum extent permitted by law, {companyName} and its affiliates, officers,
					directors, employees, agents, and licensors will not be liable for any indirect,
					incidental, special, consequential, exemplary, or punitive damages, or for loss of profits,
					revenue, data, goodwill, or business opportunity, arising from or related to these Terms or
					the Services, whether in contract, tort, or otherwise, even if advised of the possibility.
				</p>
				<p>
					Our aggregate liability arising from or related to these Terms or the Services will not
					exceed the greater of (a) the total fees you paid to us for the Services in the twelve (12)
					months before the event giving rise to the claim, and (b) USD 100.
				</p>

				<h2>16. Indemnification</h2>
				<p>
					You agree to indemnify and hold harmless {companyName} and its affiliates, officers,
					directors, employees, agents, and licensors from claims, liabilities, damages, losses, and
					expenses (including reasonable legal fees) arising from or related to (a) Your Content,
					(b) your use of the Services, (c) your breach of these Terms, (d) your violation of
					applicable law or third-party rights (including platform terms), or (e) disputes between you
					and a third party relating to content published through the Services.
				</p>

				<h2>17. Changes to these Terms</h2>
				<p>
					We may update these Terms from time to time. If a change is material, we will provide
					reasonable notice (for example by email or in-product notice). The updated date at the top
					of this page shows when the Terms were last revised. Continued use after that date
					constitutes acceptance, except where applicable law requires otherwise.
				</p>

				<h2>18. Governing law and disputes</h2>
				<p>
					Unless mandatory law in your country of residence requires otherwise, these Terms are
					governed by the laws applicable to our place of establishment, without regard to
					conflict-of-law rules. Courts with jurisdiction over that place have exclusive jurisdiction
					over disputes arising from these Terms or the Services, except that we may bring proceedings
					where you are located or where infringement of our intellectual property occurs.
				</p>
				<p>
					Nothing in this section limits non-waivable consumer rights you may have under mandatory law
					in your country of residence.
				</p>

				<h2>19. General</h2>
				<p>
					These Terms, together with the Privacy Policy and any plan-specific or order-form terms you
					accept, are the entire agreement between you and {companyName} regarding the Services. If
					any provision is invalid or unenforceable, the remainder stays in effect. Our failure to
					enforce a provision is not a waiver. You may not assign these Terms without our written
					consent; we may assign them to an affiliate or in connection with a merger, acquisition, or
					sale of assets.
				</p>

				<h2>20. Contact</h2>
				<p>
					For questions about these Terms, contact us at
					<a href={supportContactHref} class="link link-hover">{supportEmail}</a>.
				</p>
				{#if showLegalNameInContact || trimmedCompanyAddress}
					<p>You may also contact us by post at:</p>
					<ul>
						<li>
							<strong>{showLegalNameInContact ? trimmedLegalName : companyName}</strong>
							{#if trimmedCompanyAddress}
								<br />
								<span class="whitespace-pre-line">{trimmedCompanyAddress}</span>
							{/if}
						</li>
					</ul>
				{/if}
			</SubSectionInnerContainer>
		</SubSectionOuterContainer>
	</div>
</SectionOuterContainer>
