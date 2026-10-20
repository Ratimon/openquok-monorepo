import { httpGateway } from '$lib/core/index';

import type { AutoLaunchConfig } from '$lib/auto-launch/constants/config';
import { AutoLaunchRepository } from '$lib/auto-launch/AutoLaunch.repository';

const autoLaunchConfig: AutoLaunchConfig = {
	endpoints: {
		destinations: '/api/v1/auto-launch/destinations',
		businessProfiles: '/api/v1/auto-launch/business-profiles',
		profiles: '/api/v1/auto-launch/profiles',
		profileById: (id: string) => `/api/v1/auto-launch/profiles/${encodeURIComponent(id)}`,
		profileVariants: (mainId: string) =>
			`/api/v1/auto-launch/profiles/${encodeURIComponent(mainId)}/variants`,
		submissions: '/api/v1/auto-launch/submissions',
		submissionIntent: '/api/v1/auto-launch/submissions/intent',
		submissionRecordComplete: '/api/v1/auto-launch/submissions/record-complete',
		submissionListingDetails: (id: string) =>
			`/api/v1/auto-launch/submissions/${encodeURIComponent(id)}/listing-details`,
		submissionById: (id: string) => `/api/v1/auto-launch/submissions/${encodeURIComponent(id)}`,
		adminProviderCatalog: '/api/v1/auto-launch/admin/provider-catalog',
		adminDestinations: '/api/v1/auto-launch/admin/destinations',
		adminDestinationById: (id: string) =>
			`/api/v1/auto-launch/admin/destinations/${encodeURIComponent(id)}`,
		adminDestinationByProviderSlug: (providerSlug: string) =>
			`/api/v1/auto-launch/admin/destinations/by-provider/${encodeURIComponent(providerSlug)}`
	}
};

export const autoLaunchRepository = new AutoLaunchRepository(httpGateway, autoLaunchConfig);

export { AutoLaunchProductsPresenter } from '$lib/auto-launch/AutoLaunchProducts.presenter.svelte';

export type {
	BusinessProfileDto,
	AutoLaunchDestinationDto,
	AutoLaunchProductProfileKind,
	AutoLaunchProductProfileDto,
	AutoLaunchSubmissionDto,
	AutoLaunchSubmissionIntentDto
} from '$lib/auto-launch/auto-launch.types';

export {
	autoLaunchProductProfileFormSchema,
	type AutoLaunchProductProfileFormValues
} from '$lib/auto-launch/auto-launch.types';

export {
	buildBusinessProfilePickerOptions,
	businessProfileDtosToPickerOptions,
	type BusinessProfilePickerOption,
	type WorkspaceChannelGroupRow
} from '$lib/auto-launch/business-profile/buildBusinessProfilePickerOptions';

export { createBusinessProfile, type CreateBusinessProfileResult } from '$lib/auto-launch/business-profile/createBusinessProfile';

export {
	ensureIntegrationCustomerForProductProfile,
	type EnsureIntegrationCustomerResult
} from '$lib/auto-launch/business-profile/ensureIntegrationCustomerForProductProfile';

export {
	resolveIntegrationCustomerForPickerOption,
	type ResolveIntegrationCustomerResult
} from '$lib/auto-launch/business-profile/resolveIntegrationCustomerForPickerOption';
