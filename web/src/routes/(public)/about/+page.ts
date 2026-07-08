import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

export async function load({ parent, data }) {
	const { isLoggedIn: accurateIsLoggedIn } = await parent();

	if (browser && data) {
		const serverData = data as {
			companyName: string;
			companyUrl: string;
			supportEmail: string;
			responsiblePerson: string;
			pageMetaTags: MetaTagsProps;
			schemaData: unknown;
			isLoggedIn: boolean;
			companyInformationPm: unknown;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			schemaData: serverData.schemaData,
			isLoggedIn: accurateIsLoggedIn,
			companyInformationPm: serverData.companyInformationPm,
			companyName: serverData.companyName,
			companyUrl: serverData.companyUrl,
			supportEmail: serverData.supportEmail,
			responsiblePerson: serverData.responsiblePerson
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn
	};
}
