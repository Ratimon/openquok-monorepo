import { browser } from '$app/environment';

export async function load({ parent, data }) {
    // On client, get accurate auth state from parent (root layout)
    if (browser && data) {
        const { isLoggedIn: accurateIsLoggedIn } = await parent();
        const serverData = data as {
            companyName: string;
            companyUrl: string;
            supportEmail: string;
            responsiblePerson: string;
            pageMetaTags: any;
            isLoggedIn: boolean;
            companyInformationPm: any;
        };
        return {
            pageMetaTags: serverData.pageMetaTags,
            isLoggedIn: accurateIsLoggedIn, // ✅ Accurate client-side auth state
            companyInformationPm: serverData.companyInformationPm,
            companyName: serverData.companyName,
            companyUrl: serverData.companyUrl,
            supportEmail: serverData.supportEmail,
            responsiblePerson: serverData.responsiblePerson,
        };
    }
    
    return data;
}
