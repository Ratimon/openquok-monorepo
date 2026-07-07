<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import type { CanvasChannelHubLinkViewModel } from '$lib/canvas';

	import { page } from '$app/state';

	import { publicPhotoEditorCanvasPresenter } from '$lib/area-public';
	import { getRootPathMedia } from '$lib/area-protected';
	import {
		getRootPathPublicChannel,
		getRootPathPublicChannels
	} from '$lib/area-public/constants/getRootPathPublicChannels';
	import {
		getRootPathPublicPhotoEditor,
		getRootPathPublicTools
	} from '$lib/area-public/constants/getRootPathPublicTools';
	import { buildPhotoEditorFaqSection } from '$lib/canvas/constants/publicPhotoEditorFaqConfig';
	import { getRootPathSignin, getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { absoluteUrl, route, url } from '$lib/utils/path';
	import { icons } from '$data/icons';

	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import DesignMediaCanvasShell from '$lib/ui/components/media/DesignMediaCanvasShell.svelte';
	import DesignMediaExportFooter from '$lib/ui/components/media/DesignMediaExportFooter.svelte';
	import PhotoEditorHubBreadcrumb from '$lib/ui/components/photo-editor/PhotoEditorHubBreadcrumb.svelte';
	import PhotoEditorChannelHubGrid from '$lib/ui/components/photo-editor/PhotoEditorChannelHubGrid.svelte';
	import SignInToSaveEditorModal from '$lib/ui/components/photo-editor/SignInToSaveEditorModal.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_DOCS_BANNER_CTA_TEXT
	} from '$lib/ui/templates/banners/centeredDarkCtaBannerCopy';
	import {
		PHOTO_EDITOR_DOCS_BANNER,
		accentSplitPhotoEditorChannelCtaBannerDescription,
		accentSplitPhotoEditorChannelCtaBannerTitle
	} from '$lib/ui/templates/banners/photoEditorBannerCopy';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = {
		metaTitle: string;
		metaDescription: string;
		channelSlug?: string | null;
		channelLabel?: string | null;
		focusedProviderIdentifier?: string | null;
		composerMode?: 'global' | 'custom';
		isLoggedIn?: boolean;
		channelLinksVm?: CanvasChannelHubLinkViewModel[];
	};

	let {
		metaTitle,
		metaDescription,
		channelSlug = null,
		channelLabel = null,
		focusedProviderIdentifier = null,
		composerMode = 'global',
		isLoggedIn = false,
		channelLinksVm = []
	}: Props = $props();

	// /tools
	const rootPathPublicTools = getRootPathPublicTools();
	const toolsHubHref = url(route(rootPathPublicTools));

	// /tools/photo-editor
	const rootPathPublicPhotoEditor = getRootPathPublicPhotoEditor();
	const photoEditorHref = url(route(rootPathPublicPhotoEditor));

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInHrefBase = url(route(rootPathSignIn));

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	// /channels
	const channelsHubHref = route(getRootPathPublicChannels());

	const photoEditorDocsBanner = PHOTO_EDITOR_DOCS_BANNER;

	let busy = $state(false);
	let canvasApi = $state<KonvaCanvasApi | null>(null);
	const designSeed = 1;
	let showSignInDialog = $state(false);

	const signInHref = $derived.by(() => {
		const pathname = page.url.pathname || '/';
		const search = page.url.search || '';
		const redirectTarget = `${pathname}${search}`;
		return `${signInHrefBase}?redirectURL=${encodeURIComponent(redirectTarget)}`;
	});

	const pageHeading = $derived(channelLabel?.trim() ? `${channelLabel.trim()} Photo Editor` : metaTitle);
	const mediaLibraryHref = absoluteUrl(getRootPathMedia());

	let accentBannerTitle = $derived(
		channelSlug && channelLabel
			? accentSplitPhotoEditorChannelCtaBannerTitle(channelLabel)
			: photoEditorDocsBanner.title
	);
	let accentBannerDescription = $derived(
		channelSlug && channelLabel
			? accentSplitPhotoEditorChannelCtaBannerDescription(channelLabel)
			: photoEditorDocsBanner.description
	);
	let accentBannerHref = $derived(
		channelSlug
			? route(getRootPathPublicChannel(channelSlug))
			: channelsHubHref
	);
	let faqSection = $derived(buildPhotoEditorFaqSection(channelSlug, channelLabel));

	async function downloadToDevice() {
		if (!canvasApi || busy) {
			toast.error('Wait for the canvas to finish loading.');
			return;
		}

		busy = true;
		try {
			const result = await publicPhotoEditorCanvasPresenter.downloadCanvasToDevice({
				canvasApi
			});
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			toast.success('Download started.');
		} finally {
			busy = false;
		}
	}

	function handleCloudSave() {
		if (!isLoggedIn) {
			showSignInDialog = true;
		}
	}
</script>

<SectionOuterContainer class="pb-16">
	<div class="space-y-6">
		<PhotoEditorHubBreadcrumb {toolsHubHref} {photoEditorHref} {channelLabel} />

		<header class="space-y-3">
			<h1 class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">{pageHeading}</h1>
			<p class="max-w-3xl text-base text-base-content/75">{metaDescription}</p>
		</header>

		<div
			class="border-base-300 flex min-h-[min(72vh,820px)] flex-col overflow-hidden rounded-2xl border bg-base-100 shadow-sm"
		>
			<div class="border-base-300 flex shrink-0 items-center gap-2 border-b px-4 py-3 sm:px-6">
				<AbstractIcon name={icons.PaintRoller.name} class="size-5" width="20" height="20" />
				<div>
					<p class="text-sm font-semibold text-base-content">Design canvas</p>
					<p class="text-base-content/65 text-xs">
						Pick stock, templates, or upload from the left; compose on the canvas on the right.
					</p>
				</div>
			</div>

			<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-2 pb-2 sm:px-4 sm:pb-4">
				<DesignMediaCanvasShell
					bind:canvasApi
					{designSeed}
					disabled={busy}
					{composerMode}
					{focusedProviderIdentifier}
					stockPhotosVm={publicPhotoEditorCanvasPresenter.stockPhotosVm}
					designTemplatesVm={publicPhotoEditorCanvasPresenter.designTemplatesVm}
					fetchPolotnoTemplateListPage={(params, signal) =>
						publicPhotoEditorCanvasPresenter.fetchPolotnoTemplateListPagePm(params, signal)}
					backgroundPanelVm={publicPhotoEditorCanvasPresenter.backgroundPanelVm}
					loadingMinHeightClass="min-h-[240px]"
				/>
			</div>

			<DesignMediaExportFooter
				variant="public"
				{busy}
				{canvasApi}
				{isLoggedIn}
				{mediaLibraryHref}
				onDownload={downloadToDevice}
				onCloudSave={handleCloudSave}
			/>
		</div>

		{#if channelLinksVm.length > 0}
			<PhotoEditorChannelHubGrid
				{channelLinksVm}
				activeChannelSlug={channelSlug}
				genericHref={photoEditorHref}
			/>
		{/if}
	</div>

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={faqSection.faqSubtitle}
			faqTitle={faqSection.faqTitle}
			faqDescription={faqSection.faqDescription}
			faqItems={faqSection.faqItems}
			sectionClass="py-16 sm:py-20"
		/>

		<AccentSplitCtaBanner
			title={accentBannerTitle}
			description={accentBannerDescription}
			ctaText={PUBLIC_DOCS_BANNER_CTA_TEXT}
			ctaHref={accentBannerHref}
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>

<SignInToSaveEditorModal bind:open={showSignInDialog} {signInHref} />
