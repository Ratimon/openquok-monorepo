import type { ClientInformation, SocialProvider } from "./social.integrations.interface";
import { ThreadsProvider } from "./providers/threadsProvider";

const socialIntegrationList: SocialProvider[] = [new ThreadsProvider()];

export class IntegrationManager {
    getAllIntegrations() {
        return {
            social: socialIntegrationList.map((p) => ({
                name: p.name,
                identifier: p.identifier,
                toolTip: p.toolTip,
                editor: p.editor ?? "normal",
                isExternal: !!p.externalUrl,
                isWeb3: !!p.isWeb3,
                isChromeExtension: !!p.isChromeExtension,
                ...(p.extensionCookies ? { extensionCookies: p.extensionCookies } : {}),
            })),
            article: [] as unknown[],
        };
    }

    getAllowedSocialsIntegrations(): string[] {
        return socialIntegrationList.map((p) => p.identifier);
    }

    getSocialIntegration(identifier: string): SocialProvider | undefined {
        return socialIntegrationList.find((p) => p.identifier === identifier);
    }

    async enrichCatalogEntry(provider: SocialProvider) {
        const base = {
            name: provider.name,
            identifier: provider.identifier,
            toolTip: provider.toolTip,
            editor: provider.editor ?? "normal",
            isExternal: !!provider.externalUrl,
            isWeb3: !!provider.isWeb3,
            isChromeExtension: !!provider.isChromeExtension,
            ...(provider.extensionCookies ? { extensionCookies: provider.extensionCookies } : {}),
        };
        if (provider.customFields && typeof provider.customFields === "function") {
            return { ...base, customFields: await provider.customFields() };
        }
        return base;
    }

    async getAllIntegrationsWithCustomFields() {
        return {
            social: await Promise.all(socialIntegrationList.map((p) => this.enrichCatalogEntry(p))),
            article: [] as unknown[],
        };
    }

    getInternalPlugs(_identifier: string): { plugs: unknown[] } {
        return { plugs: [] };
    }

    getAllPlugs(): unknown[] {
        return [];
    }
}
