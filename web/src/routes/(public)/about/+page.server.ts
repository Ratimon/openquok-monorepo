import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicInformationRepository } from '$lib/area-public/index';

export const ssr = true;

export async function load({ url, fetch, cookies }) {
    // Lightweight auth check for header navigation
    const accessToken = cookies.get('access_token');
    const isLoggedIn = !!accessToken;

    // Fetch public data on server
    const { companyInformation: companyInformationPm } = 
        await publicInformationRepository.getAllInformationCombined();
    
    // Lazy import to avoid circular dependency
    const { CONFIG_SCHEMA_COMPANY } = await import("$lib/config/constants/config");
    
    const companyName = companyInformationPm?.config.NAME || CONFIG_SCHEMA_COMPANY.NAME.default;
    const companyUrl = companyInformationPm?.config.URL || CONFIG_SCHEMA_COMPANY.URL.default;
    const supportEmail = companyInformationPm?.config.SUPPORT_EMAIL || CONFIG_SCHEMA_COMPANY.SUPPORT_EMAIL.default;
    const responsiblePerson = companyInformationPm?.config.RESPONSIBLE_PERSON || CONFIG_SCHEMA_COMPANY.RESPONSIBLE_PERSON.default;

    const title = "About Us";
    const description = "Learn about our team and our mission, adn where to find us."

    const pageMetaTags = Object.freeze({
        title: title,
        titleTemplate: `%s | ${companyName}`,
        description: description,
        openGraph: {
            title: title,
            description: description,
        },
        canonical: new URL(url.pathname, url.origin).href,
    }) satisfies MetaTagsProps;

    return {
        pageMetaTags: pageMetaTags,
        isLoggedIn, // Available on server (approximate, will be corrected on client if needed)
        companyInformationPm,
        companyName: companyName,
        companyUrl: companyUrl,
        supportEmail: supportEmail,
        responsiblePerson: responsiblePerson,
    };
}

