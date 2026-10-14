export type AutoLaunchConfig = {
	endpoints: {
		destinations: string;
		businessProfiles: string;
		profiles: string;
		profileById: (id: string) => string;
		submissions: string;
		submissionIntent: string;
		submissionRecordComplete: string;
		adminProviderCatalog: string;
		adminDestinations: string;
		adminDestinationById: (id: string) => string;
		adminDestinationByProviderSlug: (providerSlug: string) => string;
	};
};
