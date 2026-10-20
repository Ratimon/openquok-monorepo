export type DirectorySeoDomainMetricDto = {
	domain: string;
	domainRating: number | null;
	checkedAt: string | null;
	delta7Days: number | null;
	delta30Days: number | null;
	delta90Days: number | null;
};

export type DirectorySeoCompetitorDto = {
	domain: string;
	label: string | null;
	sortOrder: number;
	domainRating: number | null;
	checkedAt: string | null;
};

export type DirectorySeoWorkspaceOverviewDto = {
	productDomain: DirectorySeoDomainMetricDto | null;
	competitors: DirectorySeoCompetitorDto[];
	providerConfigured: boolean;
	manualRefreshAvailableAt: string | null;
};

export type DirectorySeoHistoryPointDto = {
	capturedAt: string;
	domainRating: number | null;
};
