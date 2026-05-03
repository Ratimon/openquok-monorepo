import type { SocialProvider } from "./social.integrations.interface";
import type {
    GlobalPlugCatalogEntryDto,
    InternalPlugCatalogEntryDto,
    ProviderPlugsCatalogDto,
} from "../utils/dtos/PlugDTO";
import { InstagramBusinessProvider } from "./providers/instagramBusinessProvider";
import { InstagramStandaloneProvider } from "./providers/instagramStandaloneProvider";
import { ThreadsProvider } from "./providers/threadsProvider";

const socialIntegrationList: SocialProvider[] = [
    new ThreadsProvider(),
    new InstagramBusinessProvider(),
    new InstagramStandaloneProvider(),
];

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

    /** Global plug rows for API responses (aggregated from providers that expose {@link SocialProvider.globalPlugCatalog}). */
    listGlobalPlugCatalog(): { plugs: ProviderPlugsCatalogDto[] } {
        const plugs: ProviderPlugsCatalogDto[] = [];
        for (const p of socialIntegrationList) {
            const rows = p.globalPlugCatalog?.();
            if (rows?.length) {
                plugs.push({ name: p.name, identifier: p.identifier, plugs: rows });
            }
        }
        return { plugs };
    }

    getGlobalPlugDefinitionsForProvider(providerIdentifier: string): GlobalPlugCatalogEntryDto[] {
        return this.getSocialIntegration(providerIdentifier)?.globalPlugCatalog?.() ?? [];
    }

    getInternalPlugDefinitionsForProvider(providerIdentifier: string): InternalPlugCatalogEntryDto[] {
        return this.getSocialIntegration(providerIdentifier)?.internalPlugCatalog?.() ?? [];
    }

    findGlobalPlugDefinition(
        providerIdentifier: string,
        methodName: string
    ): GlobalPlugCatalogEntryDto | undefined {
        return this.getGlobalPlugDefinitionsForProvider(providerIdentifier).find((p) => p.methodName === methodName);
    }

    validatePlugFieldsAgainstCatalog(params: {
        providerIdentifier: string;
        methodName: string;
        fields: { name: string; value: string }[];
    }): string | null {
        const def = this.findGlobalPlugDefinition(params.providerIdentifier, params.methodName);
        if (!def) return `Unknown plug "${params.methodName}" for provider ${params.providerIdentifier}`;
        const allowed = new Set(def.fields.map((f) => f.name));
        for (const f of params.fields) {
            if (!allowed.has(f.name)) return `Unexpected field "${f.name}"`;
        }
        for (const spec of def.fields) {
            const row = params.fields.find((x) => x.name === spec.name);
            if (!row || row.value.trim().length === 0) return `Field "${spec.name}" is required`;
            if (spec.validation) {
                try {
                    const m = spec.validation.match(/^\/(.*)\/([a-z]*)$/);
                    const pattern = m?.[1] ?? "";
                    const flags = m?.[2] ?? "";
                    const re = new RegExp(pattern, flags);
                    if (!re.test(row.value)) return `Invalid value for "${spec.name}"`;
                } catch {
                    return `Invalid validation rule for "${spec.name}"`;
                }
            }
        }
        return null;
    }

    /** Metadata for post-level internal plugs for `identifier`. */
    getInternalPlugs(identifier: string): { internalPlugs: InternalPlugCatalogEntryDto[] } {
        return { internalPlugs: this.getInternalPlugDefinitionsForProvider(identifier) };
    }

    /** Channel-level global plugs for integrations catalog UI. */
    getAllPlugs(): ProviderPlugsCatalogDto[] {
        return this.listGlobalPlugCatalog().plugs;
    }
}
