import {
	getPayloadWizardChannelBySlug,
	PUBLIC_PAYLOAD_WIZARD_GENERIC_CONFIG,
	type PayloadWizardToolPageViewModel
} from '$lib/content/constants/channels/tools/payload-wizard/general';

export type { PayloadWizardChannelHubLinkViewModel, PayloadWizardToolPageViewModel } from '$lib/content/constants/channels/tools/payload-wizard/general';

export class PublicPayloadWizardPagePresenter {
	loadPayloadWizardVm(params: { channelSlug?: string | null } = {}): PayloadWizardToolPageViewModel {
		const channelSlug = params.channelSlug?.trim().toLowerCase() || null;
		const channelConfig = channelSlug ? getPayloadWizardChannelBySlug(channelSlug) : undefined;
		const generic = PUBLIC_PAYLOAD_WIZARD_GENERIC_CONFIG;

		return {
			metaTitle: channelConfig?.metaTitle ?? generic.metaTitle,
			heroTitle: channelConfig?.heroTitle ?? generic.heroTitle,
			metaDescription: channelConfig?.metaDescription ?? generic.metaDescription,
			channelSlug: channelConfig?.channelSlug ?? null,
			channelLabel: channelConfig?.platformLabel ?? null,
			focusedProviderIdentifier: channelConfig?.focusedProviderIdentifier ?? null,
			composerMode: channelConfig ? 'custom' : 'global',
			formatExamples: channelConfig?.formatExamples ?? []
		};
	}
}
