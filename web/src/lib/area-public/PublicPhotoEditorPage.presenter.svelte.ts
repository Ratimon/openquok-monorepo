import {
	getPhotoEditorChannelBySlug,
	PUBLIC_PHOTO_EDITOR_GENERIC_CONFIG
} from '$lib/photo-editor/constants/publicPhotoEditorChannelConfig';
import type { PhotoEditorPageViewModel } from '$lib/photo-editor/photoEditor.types';

export class PublicPhotoEditorPagePresenter {
	loadPhotoEditorVm(params: { channelSlug?: string | null }): PhotoEditorPageViewModel {
		const channelSlug = params.channelSlug?.trim().toLowerCase() || null;
		const channelConfig = channelSlug ? getPhotoEditorChannelBySlug(channelSlug) : undefined;
		const generic = PUBLIC_PHOTO_EDITOR_GENERIC_CONFIG;

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
