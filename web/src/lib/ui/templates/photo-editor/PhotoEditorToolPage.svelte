<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import type { CanvasChannelHubLinkViewModel } from '$lib/canvas';

	import { page } from '$app/state';

	import { publicPhotoEditorCanvasPresenter } from '$lib/area-public';
	import { getRootPathMedia } from '$lib/area-protected';
	import {
		getRootPathPublicPhotoEditor,
		getRootPathPublicTools
	} from '$lib/area-public/constants/getRootPathPublicTools';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { absoluteUrl, route, url } from '$lib/utils/path';
	import { icons } from '$data/icons';

	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import DesignMediaCanvasShell from '$lib/ui/components/media/DesignMediaCanvasShell.svelte';
	import DesignMediaExportFooter from '$lib/ui/components/media/DesignMediaExportFooter.svelte';
	import PhotoEditorHubBreadcrumb from '$lib/ui/components/photo-editor/PhotoEditorHubBreadcrumb.svelte';
	import PhotoEditorChannelHubGrid from '$lib/ui/components/photo-editor/PhotoEditorChannelHubGrid.svelte';
	import SignInToSaveEditorModal from '$lib/ui/components/photo-editor/SignInToSaveEditorModal.svelte';
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

	// /signin
	const rootPathSignIn = getRootPathSignin();
	const signInHrefBase = url(route(rootPathSignIn));

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

		<PhotoEditorChannelHubGrid
			{channelLinksVm}
			activeChannelSlug={channelSlug}
			genericHref={photoEditorHref}
		/>
	</div>
</SectionOuterContainer>

<SignInToSaveEditorModal bind:open={showSignInDialog} {signInHref} />
