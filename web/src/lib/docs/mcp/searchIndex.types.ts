export type DocsMcpSearchIndexEntry = {
	slug: string;
	title: string;
	description: string;
	href: string;
	locale: string;
	excerpt: string;
};

export type DocsMcpSearchIndexFile = {
	generatedAt: string;
	entries: DocsMcpSearchIndexEntry[];
};
