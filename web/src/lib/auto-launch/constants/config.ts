export const AUTO_LAUNCH_PROFILE_MEDIA_BUCKET = 'auto_launch_profile_media' as const;

export type AutoLaunchConfig = {
	endpoints: {
		destinations: string;
		businessProfiles: string;
		profiles: string;
		profileById: (id: string) => string;
		submissions: string;
		submissionIntent: string;
		submissionRecordComplete: string;
		submissionListingDetails: (id: string) => string;
		submissionById: (id: string) => string;
		adminProviderCatalog: string;
		adminDestinations: string;
		adminDestinationById: (id: string) => string;
		adminDestinationByProviderSlug: (providerSlug: string) => string;
	};
};
