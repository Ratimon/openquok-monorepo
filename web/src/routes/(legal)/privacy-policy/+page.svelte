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
	let { companyName, companyUrl, supportEmail } = $derived(data);

	let supportContactHref = $derived(
		supportEmail.includes('@') ? `mailto:${supportEmail}` : supportEmail
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
			<SectionTitle>Privacy Policy for {companyName}</SectionTitle>
			<SectionDescription>Last updated April 12, 2026</SectionDescription>
		</SectionHeaderContainer>
		<SubSectionOuterContainer class="max-w-3xl !py-4">
			<SubSectionInnerContainer
				class="prose max-w-none items-start text-justify text-base-content prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-base-content prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-xl prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-lg prose-h4:mt-5 prose-h4:mb-2 prose-h4:text-base prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base-content/90 prose-strong:text-base-content prose-a:text-primary prose-li:marker:text-base-content/60"
			>
				<p>
					This Privacy Policy describes how <strong>{companyName}</strong> (“we”, “us”) collects,
					uses, stores, and shares personal information when you use our websites and services
					(including scheduling and social integrations), accessible at
					<a href={companyUrl} class="link link-hover">{companyUrl}</a>. By using the services,
					you acknowledge the practices described here.
				</p>
				<p>
					This page is published at a <strong>public, non-geo-blocked URL</strong> so people and
					automated systems (including crawlers used by developer platforms to confirm that policy
					and consent links work) can retrieve it. Meta describes those crawlers and
					<code>robots.txt</code> expectations in its
					<a
						href="https://developers.facebook.com/docs/sharing/webmasters/web-crawlers"
						class="link link-hover"
						rel="noopener noreferrer nofollow"
						target="_blank"
					>
						web crawler documentation for site owners
					</a>
					and its
					<a
						href="https://developers.facebook.com/docs/development/terms-and-policies/privacy-policy/"
						class="link link-hover"
						rel="noopener noreferrer nofollow"
						target="_blank"
					>
						privacy policy expectations for apps that use Meta technologies
					</a>. Our site’s <code>/robots.txt</code> explicitly allows the Meta-related user agents
					listed there so they are not blocked from public pages.
				</p>

				<h2>1. Our services and third-party platforms</h2>
				<p>
					{companyName} provides tools to plan, manage, and publish content, including optional
					connections to third-party social and messaging platforms (each a “Platform”) when you
					choose to link an account.
				</p>
				<ul>
					<li>
						Collection, use, and disclosure of personal information by a Platform are governed
						solely by that Platform’s own terms and privacy policy. We do not control their
						practices.
					</li>
					<li>
						If you use our services on behalf of an organization, your organization may have its
						own policies for workspace data and team members. Where applicable, the organization
						may act as a separate controller of certain information.
					</li>
					<li>
						When you collect or process information about other people through connected
						Platforms (for example audience or engagement data), you are responsible for complying
						with applicable laws, obtaining any required consents, and providing any required
						notices. Questions or complaints about your use of such data are generally directed to
						you as the account holder; we may assist only as needed to operate the service.
					</li>
				</ul>

				<h2>2. Information we collect</h2>
				<p>
					We collect information about you as reasonably necessary for the activities described
					below, including information you provide directly, information we collect automatically,
					and information we receive from third parties (such as identity providers, payment
					processors, analytics subprocessors, or Platforms you connect).
				</p>

				<h3>2.1 Using our services</h3>
				<p>When you use our services, we may collect the following categories of information.</p>

				<h4>Account information</h4>
				<ul>
					<li>
						Contact and profile information, including your name, email address, organization or
						workspace name, and postal or billing address when you choose to provide it.
					</li>
					<li>
						Preferences such as language, time zone, and the types of communications you would like
						to receive from us, where those settings exist in the product.
					</li>
					<li>
						Profile image or avatar and other optional profile fields you add (for example short
						bio, website links, or self-described location text).
					</li>
					<li>
						We may obtain account details from an identity provider when you use social login or
						single sign-on (for example sign-in with a Platform such as Facebook Login, Google, or
						GitHub), including identifiers the provider associates with your account.
					</li>
					<li>
						Workspace and membership data, including roles, invitations, and identifiers for
						organizations you belong to.
					</li>
				</ul>

				<h4>Billing and other payment information</h4>
				<ul>
					<li>
						If you sign up for a paid service, we and our payment processors may collect billing
						contact details and payment method information. Card or bank details are typically
						collected directly by the processor; we may receive a limited subset (for example last
						four digits, brand, expiry, billing address, or payment tokens) and transaction
						identifiers.
					</li>
					<li>
						Commercial information about the services you acquire from us, including plan type,
						number of seats or team members, subscription identifiers, and transaction or invoice
						history related to the services.
					</li>
				</ul>

				<h4>Content</h4>
				<ul>
					<li>
						<strong>Connected Platform profiles and credentials:</strong> When you connect a
						social or messaging Platform, we may receive profile information for that account (for
						example Platform user id, username or handle, display name, profile image URL, and other
						fields exposed by the Platform’s authorization or APIs). We also store integration
						credentials needed to maintain the connection (for example OAuth access tokens, refresh
						tokens, and token expiration metadata).
					</li>
					<li>
						<strong>Location you choose to share:</strong> If you provide a specific location (for
						example an address, city, or place such as a venue) in content, profile fields, or
						scheduling metadata, we collect and store that information as you submit it.
					</li>
					<li>
						<strong>Your material in the product:</strong> Messages, posts, comments, images,
						attachments, drafts, captions, and other material you curate, compose, or upload to the
						services, including content synchronized from or destined for connected Platforms where
						you enable those features.
					</li>
					<li>
						<strong>User-generated and social content:</strong> Content and metadata from
						connected Platforms that you choose to display or process through the services (for
						example posts, comments, pages or profiles, reactions, likes, feeds, or similar
						signals), within the limits of each integration.
					</li>
					<li>
						<strong>Messaging content:</strong> Content from social or in-product messaging
						features where you connect messaging channels or send messages through the services, as
						permitted by the integration and your settings.
					</li>
					<li>
						<strong>Social and messaging metadata:</strong> Metrics and descriptors associated with
						connected accounts or content (for example follower or subscriber counts, post counts,
						engagement statistics, thread identifiers, or timestamps), as returned by Platforms or
						generated in the product.
					</li>
					<li>
						<strong>Third-party personal information in content:</strong> Content you send or
						receive through Platforms or messaging channels (including SMS or similar channels if
						supported) may contain personal information about other people—for example names,
						photos, age or age range, gender, geographic location, opinions, preferences, or phone
						numbers supplied or visible in social interactions. You are responsible for lawful
						collection and use of such information when you bring it into the services.
					</li>
				</ul>

				<h4>Logs, usage, and support data</h4>
				<ul>
					<li>
						<strong>Log data:</strong> May include your IP address, the address of the web page you
						visited before using the services (referrer), browser type and settings, device
						information (such as make, model, and operating system), date and time of use,
						browser configuration, language preferences, unique identifiers, and data from cookies
						or similar technologies.
					</li>
					<li>
						<strong>Usage data and analytics:</strong> May include frequency of logins, session
						duration, feature usage, navigation paths, and the types of activity you undertake (for
						example frequently accessed areas of the product), including product analytics or error
						reporting tools we or our subprocessors operate.
					</li>
					<li>
						<strong>General location:</strong> Derived from IP address, account or device settings,
						or Platform payloads (for example region or time zone associated with login or
						publishing).
					</li>
					<li>
						<strong>Support and feedback:</strong> Questions, issues, attachments, and general
						feedback you choose to provide through support channels or in-product feedback features.
					</li>
					<li>
						<strong>Security-related records:</strong> Such as authentication events, refresh-token
						issuance metadata (for example IP address or user agent where stored), fraud signals, and
						audit trails used to protect accounts and the service.
					</li>
				</ul>

				<h3>2.2 Surveys, events, marketing, and other activities</h3>
				<p>
					If you participate in surveys, contests, webinars, in-person events, or similar
					activities that we host or are affiliated with, we may collect:
				</p>
				<ul>
					<li>
						Contact information such as your name, email address, telephone number, organization
						name, and address, as requested on registration or RSVP forms.
					</li>
					<li>Participation, attendance, feedback, and opinions you submit.</li>
					<li>
						General information about your organization that you choose to provide (for example
						industry, approximate company size, or revenue band).
					</li>
					<li>
						We may also use service providers to enrich business-related information about your
						organization from public or licensed sources (for example legal entity name, size, or
						publicly stated revenue) to tailor offerings, where permitted by law.
					</li>
				</ul>

				<h3>2.3 Other interactions with us</h3>
				<ul>
					<li>
						<strong>Brand and community channels:</strong> Messages, posts, mentions, and other
						interactions with our official brand or community accounts on third-party social
						platforms, when you choose to engage with us there.
					</li>
					<li>
						<strong>Email interactions and analytics:</strong> How you engage with emails we send
						(for example delivery events, opens, clicks, links followed, subsequent pages visited,
						browser or mail client type, and general location such as country or region), where
						tracking pixels or similar technologies are used.
					</li>
					<li>
						<strong>Calls and meetings:</strong> Preferences, feedback, opinions, and business
						needs you share during sales or support calls, webinars, or video meetings; and
						recordings of those sessions <strong>only where we notify you and you agree</strong> to
						recording.
					</li>
					<li>
						<strong>Gated or downloadable resources:</strong> If we offer resources such as
						videos, whitepapers, or case studies behind a form, we may collect your name and contact
						details and engagement analytics (for example which assets you view or download and how
						often).
					</li>
				</ul>

				<h3>2.4 Browsing our websites</h3>
				<p>
					When you browse our marketing sites, documentation, or other public web properties, we
					may collect information as described below, including automatic collection by us or by
					authorized service providers.
				</p>
				<ul>
					<li>
						<strong>Automated chat or assistants:</strong> If we offer chatbots or similar tools,
						we may collect your name, email address, the substance of your request, and related
						context about your use of the services.
					</li>
					<li>
						<strong>Cookies and similar technologies:</strong> We and our subprocessors may use
						cookies, web beacons, pixels, software tokens, and similar technologies on our websites
						and embedded content. See our
						<a href="/cookie-policy" class="link link-hover">Cookie Policy</a> for more detail and
						choices where available.
					</li>
					<li>
						<strong>Website usage data:</strong> May include engagement metrics, the address of the
						previous web page that referred you, browser type, and—where we or a provider configure
						such tools—session replay, scroll or click patterns, or other interaction telemetry used
						to diagnose usability issues or abuse.
					</li>
				</ul>

				<h2>3. How we use your information</h2>
				<p>
					We use personal information only where we have an appropriate legal basis under applicable
					law (for example performance of a contract, legitimate interests, consent where
					required, or legal obligation). The purposes below describe how and why we process data
					in practice.
				</p>
				<p>We use your information for the purposes described in the following sections.</p>

				<h3>3.1 Providing and securing our services</h3>
				<ul>
					<li>
						<strong>Identify and authenticate:</strong> To verify who you are, maintain secure
						sessions, and ensure that only authorized users can use the services for their
						organization (or personal workspace) and make permitted changes to accounts, roles, and
						settings.
					</li>
					<li>
						<strong>Account setup and management:</strong> To use information you provide at sign-up
						or onboarding to create and administer your account, process payments where applicable,
						contact you about the services (for example onboarding, billing, or important
						service-related notices), and manage subscriptions, seats, and workspace configuration.
					</li>
					<li>
						<strong>Inquiries and the contractual relationship:</strong> To use your contact
						information and details related to your request to respond to questions, manage our
						contract with you (or with your organization), handle support tickets, and send
						operational updates and information about the services (including changes that affect
						your use of the product).
					</li>
					<li>
						<strong>Performance, security, and compliance:</strong> To use logging and related
						technical data—including general location derived from IP address or device signals—to
						operate, monitor, and protect the services, manage capacity and reliability, detect abuse,
						meet security requirements, and comply with obligations that apply to us (including
						developer or platform program rules where relevant).
					</li>
					<li>
						<strong>Location-based features:</strong> Where you choose to share specific location
						information, to provide features that depend on it—for example attaching or publishing
						location with posts on connected Platforms that support it, or other functionality that
						relies on precise or coarse location you supply.
					</li>
					<li>
						<strong>Analysis and service improvement:</strong> To analyze usage information, social
						or messaging metadata available through integrations, product feedback, support queries,
						and survey responses (where you participate) to identify issues, understand how the
						services are used, prioritize improvements, and produce aggregated analytics, insights, or
						measurement summaries that do not identify you as an individual where appropriate.
					</li>
					<li>
						<strong>Content and connected Platforms:</strong> To use content and related information
						that you send, receive, synchronize, or curate through connected Platforms—including
						messages, posts, comments, images, promotional or campaign material, and other assets
						you upload or manage in the services—to provide scheduling, publishing, engagement, and
						related product capabilities you request.
					</li>
					<li>
						<strong>Integrations and credentials:</strong> To store and refresh tokens and to call
						Platform APIs on your behalf strictly as needed to deliver the integrations you enable.
					</li>
				</ul>

				<h3>3.2 Communicating with you</h3>
				<ul>
					<li>
						<strong>Service, events, and marketing:</strong> To use your contact information, where
						appropriate, to send information about the services, invitations to webinars or events,
						and marketing communications consistent with your preferences and applicable law (including
						opt-in or opt-out mechanisms where required).
					</li>
					<li>
						<strong>Email and engagement measurement:</strong> To use statistics such as open and
						click rates, and related engagement analytics, to assess the effectiveness of our
						communications, improve messaging and deliverability, and better understand your needs so
						we can provide information and service options that are more relevant to you.
					</li>
					<li>
						<strong>Transactional messages:</strong> Certain operational messages (for example
						security alerts, verification, billing receipts, or mandatory notices) may be sent
						independently of marketing preferences where they are necessary to provide or secure the
						services.
					</li>
				</ul>

				<h3>3.3 Improving our websites and applications</h3>
				<ul>
					<li>
						To use information about you and your activity to understand usage patterns and other
						activities on our websites and applications, diagnose problems, and make improvements—including
						enhancing usability, performance, and security across the product and public sites.
					</li>
					<li>
						To use personalization technologies or rules (on websites or in-product) to present
						information that may be more relevant to you—for example highlighting documentation,
						resources, or prompts aligned with your industry, organization size, or prior interactions,
						where we implement such features.
					</li>
					<li>
						<strong>Support, sales, and training:</strong> If you provide information about yourself,
						your use of social or messaging services, or other feedback during telephone calls, video
						meetings, chat, or similar interactions with our customer support or sales teams, we may
						use, monitor, and record that information—<strong
							>including recordings only where we notify you and you agree</strong
						>—for training, quality assurance, improving internal sales and marketing processes, and
						improving the services.
					</li>
				</ul>

				<h3>3.4 Legal and safety</h3>
				<ul>
					<li>
						To comply with applicable law, regulation, or lawful requests from public authorities.
					</li>
					<li>
						To establish, exercise, or defend legal claims, and to protect the rights, property, or
						safety of {companyName}, our users, or others.
					</li>
					<li>
						To aggregate or de-identify information where permitted, so it can no longer reasonably
						be linked to you, and to use that data for analytics, benchmarking, or research.
					</li>
				</ul>

				<h2>4. Your rights regarding your information</h2>

				<h3>4.1 Services information</h3>
				<p>
					When using our services, you may access, update, or correct most of your account information
					by signing in and editing your profile or organization record.
				</p>
				<p>
					If you have requests that cannot be carried out by logging in—including accessing
					additional information or deleting information about you—please contact us in writing at
					<a href={supportContactHref} class="link link-hover">{supportEmail}</a>. Please note that we
					may need to retain certain information about you for as long as you maintain an account,
					to provide the services, for record-keeping, for payment processing, to comply with legal
					and regulatory obligations, to resolve disputes, or to enforce our terms and other
					agreements between you (or your organization) and {companyName} (collectively, our
					<strong>“Terms”</strong>).
				</p>
				<p>
					Requests to access, correct, update, or delete your information will be handled within
					<strong>thirty (30) days</strong> unless they are unusually extensive or complex, in which
					case we will advise you of the expected timeline.
				</p>
				<p>
					If you have authorized us to access a Platform account to provide the services, you may
					revoke that access at any time—for example by disconnecting the integration in the product,
					revoking the app in that Platform’s account or security settings, or contacting us at
					<a href={supportContactHref} class="link link-hover">{supportEmail}</a> for assistance. For
					Platform-specific APIs, the Platform’s own permissions or security pages may also allow you
					to revoke access to data we would otherwise receive through the integration.
				</p>
				<p>
					For other general requests, contact our support team at
					<a href={supportContactHref} class="link link-hover">{supportEmail}</a>.
				</p>
				<p>
					Depending on where you live, you may have additional statutory rights (for example to
					object to or restrict certain processing or to request data portability). Use the same
					contact address and we will respond in line with applicable law.
				</p>

				<h3>4.2 Marketing emails, advertising, and website browsing</h3>
				<p>
					For marketing communications, you may opt out by following the unsubscribe link in any
					marketing email you receive from us. If you have an account, unsubscribing from marketing
					will not affect product-generated or transactional emails sent in connection with your use
					of the services.
				</p>
				<p>
					We may participate in interest-based advertising (for example where you have visited our
					sites or third-party sites that allow us to show ads related to our services). Industry
					groups publish tools that can help you understand which third parties have enabled cookies
					in your browser and how to opt out—for example the Network Advertising Initiative
					<a
						href="https://optout.networkadvertising.org/"
						class="link link-hover"
						rel="noopener noreferrer nofollow"
						target="_blank"
					>
						consumer choice page
					</a>
					. You can also review your browser’s cookie controls.
				</p>
				<p>
					For more on marketing and similar cookies, see our
					<a href="/cookie-policy" class="link link-hover">Cookie Policy</a>.
				</p>

				<h2>5. Who has access to your information</h2>
				<p>
					{companyName} does not rent or sell your personal information. We restrict access to
					authorized personnel and contractors who need it for their job, and we do not share your
					information with third parties except as described below.
				</p>

				<h3>5.1 Authorized contractors and employees</h3>
				<p>
					Our employees and authorized contractors may access information about you when they need it
					to perform their role—for example customer support to validate your identity and respond to
					a request, communications staff to manage email lists and unsubscribe requests, or security
					staff to investigate abuse, fraud, denial-of-service attempts, or other threats to the
					services. They are required to protect confidentiality and handle data in line with this
					policy.
				</p>

				<h3>5.2 Service providers, resellers, and partners</h3>
				<p>
					We share limited information with service providers that assist us with hosting, databases,
					email delivery, analytics, security, marketing operations, customer relationship tools,
					professional services, and payment processing. We limit subprocessors who may process your
					content strictly to what is needed to deliver the services.
				</p>
				<p>
					If you purchase through an authorized reseller or partner, we may exchange information with
					that party as needed to support your purchase, onboarding, and ongoing use of the services.
				</p>
				<p>
					When we share information with service providers, resellers, or partners, we require
					contractual commitments consistent with this Privacy Policy, including appropriate
					confidentiality and security measures, and processing limited to providing the services and
					your requests.
				</p>

				<h3>5.3 Marketing events and sponsors</h3>
				<p>
					We may run or co-host events (for example webinars or conferences) with sponsors or other
					organizations. If a sponsor wishes to collect your information for its own marketing, it
					does so under its own privacy policy; we may facilitate collection (for example on a shared
					registration form) only where we clearly disclose that fact and give you a choice to share
					your information with the sponsor, such as at registration or during the event.
				</p>

				<h3>5.4 Connected Platforms and third-party services</h3>
				<p>
					When you connect a Platform or authorize a third-party service to access your account, you
					agree that information about you may be processed by that Platform or service under its own
					terms and privacy policy. We do not control their practices.
				</p>

				<h3>5.5 Customer organizations</h3>
				<p>
					If your employer or another entity purchases or administers the services for you, we may
					disclose limited information—such as your name, email address, and high-level usage
					information (for example login activity or time using the services)—to help that organization
					manage licenses, security, adoption, or training related to the services, in line with your
					agreements with them and with us.
				</p>

				<h3>5.6 Affiliates and corporate transactions</h3>
				<p>
					We may share information among {companyName}-controlled affiliates or successors, who must
					handle it consistently with this Privacy Policy (or notify you if a successor policy
					applies). We may disclose information as part of a merger, acquisition, financing, or sale
					of assets; where required, we will ensure appropriate continuity of protections or inform
					you of material changes.
				</p>

				<h3>5.7 Law enforcement, regulators, and professional advisors</h3>
				<p>
					We may disclose information where we believe in good faith that it is necessary to comply
					with law, regulation, court order, or legal process, or to establish, exercise, or defend
					legal claims. For governmental access requests concerning you or your organization, we will
					seek to redirect the request to you or notify you where we are not legally prohibited from
					doing so.
				</p>
				<p>
					We may also disclose information to investigate or address illegal activity, fraud, threats
					to the rights or property of {companyName} or others, personal safety, or abuse of our
					infrastructure (for example spam or denial-of-service attacks).
				</p>
				<p>
					We use professional advisors (such as lawyers and accountants) and may disclose information
					to them as necessary for their services and for audits, financial reporting, or regulatory
					reviews.
				</p>

				<h2>6. International data transfers</h2>
				<p>
					Under laws such as the EU General Data Protection Regulation (GDPR) and similar regimes,
					personal information may only be transferred to another country when appropriate safeguards
					apply—for example adequacy decisions, standard contractual clauses, or other lawful transfer
					mechanisms.
				</p>
				<p>
					We and our subprocessors may process or store personal information in countries including
					the United States and other regions where our hosting, payment, or technology partners
					operate. Where information is transferred from the European Economic Area, the United
					Kingdom, Switzerland, or similar jurisdictions, we rely on mechanisms recognized under
					applicable law (such as standard contractual clauses or supplementary measures) unless an
					adequacy decision or other valid basis applies.
				</p>
				<p>
					By its nature, data you exchange through connected Platforms may be visible or stored
					globally according to those Platforms’ terms and policies.
				</p>

				<h2>7. How we safeguard your information</h2>
				<p>
					We maintain industry-standard administrative, technical, and physical safeguards designed
					to protect personal information. This includes security and privacy training for personnel
					who need access to personal data, so they understand the measures required to protect it.
				</p>
				<p>
					Access controls limit access to personal information to people who need it to perform their
					work—for example, customer support staff may access your account details to verify your
					identity and help with a request. People authorized to handle personal information are
					subject to confidentiality obligations.
				</p>
				<p>
					We encrypt data in transit and at rest where appropriate. We assess service providers’
					security and privacy practices where they process personal data on our behalf and use
					contractual protections (including data processing terms) when required. Payment card data
					is handled by PCI-certified payment processors; we do not store full card numbers on our
					own systems.
				</p>
				<p>
					No method of transmission or storage is completely secure. You should use strong passwords,
					protect workspace invitations, and review connected integrations regularly.
				</p>

				<h2>8. How long we retain your information</h2>
				<p>
					For some connected Platform data, the product may retrieve or refresh information when
					you use the services so it can be shown or used in your session, while credentials and
					content you create in the product (for example drafts, schedules, and workspace material)
					may be stored so you can access it across sessions. Aggregated or de-identified data may be
					used for analysis, product improvement, and troubleshooting.
				</p>
				<p>
					Content may continue to exist on a third-party Platform even after you or we delete it from
					our services. To remove content from the Platform itself, you may need to use that
					Platform’s tools or contact its support.
				</p>
				<p>
					We retain personal information for as long as needed to provide the services you have
					requested, for record-keeping, to comply with legal and regulatory obligations, to resolve
					disputes, and to enforce our agreements. When it is no longer necessary to retain
					information about you, or when you make a valid deletion request we can fulfil, we will
					delete it in a secure manner or anonymize it, subject to technical limits such as backup and
					archival cycles.
				</p>

				<h2 id="gdpr-roles">9. Our roles under the GDPR and UK data protection laws</h2>
				<p>
					Depending on the situation and the type of data involved, {companyName} may act as a
					<strong>data controller</strong> or a <strong>data processor</strong> under the EU General
					Data Protection Regulation (GDPR), the UK GDPR, and related UK data protection legislation.
				</p>

				<h3>9.1 When we act as a data controller</h3>
				<p>We typically act as a controller when we decide why and how personal data is processed, for example when we are:</p>
				<ul>
					<li>
						Collecting information from you to set up and administer your account (for example
						account contact and profile details such as your name and email address).
					</li>
					<li>Monitoring usage information on our websites and applications.</li>
					<li>
						Managing your contact details and related preferences to send marketing, service, and
						other communications to you, consistent with this policy and your choices.
					</li>
					<li>Responding to a support or general inquiry you send us.</li>
					<li>
						Recruiting individuals for employment or contractor roles, where we operate recruitment
						activities.
					</li>
				</ul>

				<h3>9.2 Legal bases when we act as a controller</h3>
				<p>Where we are a controller, we rely on one or more of the following legal bases as applicable:</p>
				<ul>
					<li>
						<strong>Consent</strong> — for example where you submit information to create an account,
						register for a webinar or event, subscribe to marketing, or provide employment-related
						information as part of an application. Where we rely on consent, you may withdraw it at
						any time without affecting the lawfulness of processing before withdrawal.
					</li>
					<li>
						<strong>Contract</strong> — where processing is necessary to perform our agreement with
						you (or to take steps at your request before entering an agreement), including providing
						and supporting the services you have acquired.
					</li>
					<li>
						<strong>Legitimate interests</strong> — for example to provide, maintain, and improve the
						services, to keep them secure, to understand how they are used, and to promote demand for
						our services in a way that respects your rights and freedoms.
					</li>
					<li>
						<strong>Legal obligation</strong> — where we must process personal data to comply with
						applicable law (for example tax, accounting, or employment-related obligations).
					</li>
					<li>
						<strong>Vital or public interests</strong> — in rare cases, such as protecting vital
						interests or where strictly required by law.
					</li>
				</ul>

				<h3>9.3 Your rights when we act as a controller</h3>
				<p>
					Where we act as a controller, the rights described in <strong>Section 4</strong> (Your
					rights regarding your information) apply, subject to applicable law.
				</p>
				<p>You may also have the following rights, where they apply:</p>
				<ul>
					<li>
						<strong>Right to object</strong> — for example to object to processing based on
						legitimate interests or to direct marketing (including profiling related to marketing).
					</li>
					<li>
						<strong>Right to restrict processing</strong> — for example where you contest accuracy of
						data or object to processing pending verification.
					</li>
					<li>
						<strong>Right to data portability</strong> — to receive certain personal data you
						provided in a structured, commonly used, machine-readable format, or to have it
						transmitted to another controller where technically feasible.
					</li>
				</ul>
				<p>
					For help with any of these requests, email us at
					<a href={supportContactHref} class="link link-hover">{supportEmail}</a>.
				</p>

				<h3>9.4 When we act as a data processor</h3>
				<p>
					When you use our services and determine the purposes and means of processing personal data
					in them—including choosing which Platform accounts to connect or uploading and using
					content—you may act as a <strong>data controller</strong> (for your organization or yourself),
					and {companyName} acts as a <strong>data processor</strong> for that processing.
				</p>
				<p>
					As a controller, you are responsible for complying with applicable data protection laws for
					that processing, including lawfulness of content and integrations you configure. As a
					processor, we process personal data on documented instructions from you (including through
					your use of the product), subject to our Terms, applicable Platform terms, and applicable law.
					As part of delivering the services, we may also process content to improve the services (for
					example usability, reliability, security, and new features) where permitted by our agreement
					with you and by law.
				</p>
				<p>
					If you require a written data processing agreement under Article 28 GDPR or equivalent UK
					requirements, contact us at
					<a href={supportContactHref} class="link link-hover">{supportEmail}</a> to request our
					standard data processing addendum, where available for your use case.
				</p>
				<p>
					If you use the services as an authorized user of a {companyName} customer (for example your
					employer or another organization), that customer may determine its own policies regarding
					access, modification, deletion, sharing, and retention of personal data and content. Please
					check with that customer for the rules that apply to your use of the services.
				</p>

				<h2 id="california-rights">10. Your California privacy rights</h2>
				<p>
					If you are a California resident and the California Consumer Privacy Act as amended by the
					California Privacy Rights Act (together, the <strong>“California Privacy Laws”</strong>)
					applies to you, this section provides additional information. Capitalized terms used in
					statutes have the meanings given in the California Privacy Laws.
				</p>

				<h3>10.1 Your rights</h3>
				<p>
					Section 4 describes how to exercise several rights. In addition, the California Privacy Laws
					may grant you rights including:
				</p>
				<ul>
					<li>
						The <strong>right to know</strong> what personal information we collect, including the
						categories described in <strong>Section 2</strong> (Information we collect) above.
					</li>
					<li>The <strong>right to delete</strong> personal information we hold, subject to exceptions.</li>
					<li>
						The <strong>right to correct</strong> inaccurate personal information, taking into account
						the nature of the data and the purposes of processing.
					</li>
					<li>
						The <strong>right not to receive discriminatory treatment</strong> for exercising any
						privacy rights the California Privacy Laws provide.
					</li>
				</ul>
				<p>
					You may access, update, or correct much of your account information by signing in to your
					account. For other requests under the California Privacy Laws, contact us at
					<a href={supportContactHref} class="link link-hover">{supportEmail}</a>.
				</p>
				<p>
					We disclose personal information to service providers as described in this policy (for
					example to host the services, send email, or process payments). We do
					<strong>not sell</strong> your personal information as “sell” is defined under the California
					Privacy Laws.
				</p>

				<h2>11. Children</h2>
				<p>
					The services are not directed to children under the age where parental consent is
					required in their jurisdiction. We do not knowingly collect personal information from such
					children. If you believe we have done so, contact us and we will take appropriate steps.
				</p>

				<h2>12. Changes to this policy</h2>
				<p>
					We may change this Privacy Policy at any time to reflect updates to our services, applicable
					laws, and other factors. If we make material changes, we will provide a prominent notice on
					this website and/or through the services where appropriate. We encourage you to review this
					policy periodically to stay informed.
				</p>

				<h2>13. Contact</h2>
				<p>
					For questions about this Privacy Policy or our data practices, contact us at
					<a href={supportContactHref} class="link link-hover">{supportEmail}</a>.
				</p>
			</SubSectionInnerContainer>
		</SubSectionOuterContainer>
	</div>
</SectionOuterContainer>
