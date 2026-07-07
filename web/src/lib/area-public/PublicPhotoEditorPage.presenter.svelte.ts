import {
	getCanvasChannelBySlug,
	PUBLIC_CANVAS_GENERIC_CONFIG,
	type CanvasToolPageViewModel
} from '$lib/canvas';

export class PublicPhotoEditorPagePresenter {
	loadPhotoEditorVm(params: { channelSlug?: string | null }): CanvasToolPageViewModel {
		const channelSlug = params.channelSlug?.trim().toLowerCase() || null;
		const channelConfig = channelSlug ? getCanvasChannelBySlug(channelSlug) : undefined;
		const generic = PUBLIC_CANVAS_GENERIC_CONFIG;

		return {
			metaTitle: channelConfig?.metaTitle ?? generic.metaTitle,
			metaDescription: channelConfig?.metaDescription ?? generic.metaDescription,
			channelSlug: channelConfig?.channelSlug ?? null,
			channelLabel: channelConfig?.platformLabel ?? null,
			focusedProviderIdentifier: channelConfig?.focusedProviderIdentifier ?? null,
			defaultAspectRatioId: channelConfig?.defaultAspectRatioId ?? generic.defaultAspectRatioId,
			aspectPlatformGroupId: channelConfig?.aspectPlatformGroupId ?? generic.aspectPlatformGroupId,
			composerMode: channelConfig ? 'custom' : 'global'
		};
	}
}
