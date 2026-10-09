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
			<SectionDescription>Last updated October 9, 2026</SectionDescription>
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
				analyze usage. Essential cookies are necessary for the site to work, including
				security and fraud prevention. They are strictly necessary and are not controlled by
				a marketing or analytics consent choice. Analytics cookies, when we use them, stay
				separate from these essential cookies.
			</p>

			<h2>
				Essential cookies we set</h2>
			<ul>
				<li>
					<strong><code>oq_cloud_trial_browser</code></strong> — a first-party cookie that
					stores a random identifier so we can offer <strong>one</strong> Cloud free trial
					per browser. We use it to prevent repeat trials, including when someone registers
					again with a different email on the same browser. We keep it for about one year.
					See section 5 of our
					<a href="/terms" class="link link-hover">Terms of Service</a>
					and the
					<a href="/docs/cloud/trial" class="link link-hover">free trial</a>
					documentation.
				</li>
			</ul>

			<h2>
				Third-party site cookies (browser extension connect)</h2>
			<p>
				OpenQuok’s own website cookies (above) are separate from cookies on social platforms you
				visit in Chrome. When you choose to connect certain channels through our optional browser
				extension, you start the flow on {companyUrl}. The extension reads session cookies from the
				platform’s domain (for example Skool) only at that time and when you allow periodic session
				refresh. Those cookies are sent to our API so we can validate and store an encrypted session
				for publishing — not for ads or cross-site tracking on {companyUrl}. We do not set those
				third-party cookies on your behalf; they are set by the platform when you sign in there.
				Disconnect the channel in OpenQuok and clear site data for that platform in Chrome if you
				want to end local access. Details are in our
				<a href="/privacy-policy" class="link link-hover">Privacy Policy</a>.
			</p>

			<h2>
				Local browser storage</h2>
			<p>
				Some features use the browser’s <strong>local storage</strong> API instead of HTTP cookies.
				Like essential cookies, this storage is used for functionality you ask for on the site, not
				for third-party advertising.
			</p>
			<ul>
				<li>
					<strong>OpenQuok browser extension (Chrome)</strong> — when you connect a
					browser-extension channel, the extension may store a signed refresh token and related
					settings in <strong>Chrome extension local storage</strong> so it can call our
					extension-refresh API with updated session identifiers about once per day. Removing the
					extension or disconnecting the channel in OpenQuok ends that storage for new refreshes.
					Session cookies themselves remain on the platform site until you sign out or clear that
					site’s data in Chrome.
				</li>
				<li>
					<strong><code>openquok:build-backlinks-bookmarks:v1</code></strong> — on the
					<a href="/build-backlinks" class="link link-hover">Build Backlinks</a> hub, stores the
					site slugs and internal directory identifiers for sites you save while you are
					<strong>not</strong> signed in, so your shortlist persists on this device. When you sign
					in, we merge that list into your account bookmarks and remove this entry from local
					storage. You can clear it at any time through your browser’s site data or storage
					settings.
				</li>
			</ul>

			<h2>
				Managing Cookies</h2>
			<p>
				You can control cookies through your browser settings. Clearing site data or local
				storage for {companyUrl} removes saved Build Backlinks shortlists on that browser when
				you are not signed in. Disabling non-essential cookies may limit some features. For
				questions about our cookie and storage practices, contact us at {supportEmail}.
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
