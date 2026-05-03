import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { IntegrationLike } from "../utils/dtos/IntegrationDTO";
import type { RefreshIntegrationService } from "./RefreshIntegrationService";
import type {
    AuthTokenDetails,
    ClientInformation,
    FetchPageInformationResult,
} from "../integrations/social.integrations.interface";
import type { IntegrationTimeDto } from "../data/schemas/integrationTimeSchemas";
import type { IntegrationService } from "./IntegrationService";
import type { PlugService } from "./PlugService";
import type { PlugUpsertBodyDto } from "../utils/dtos/PlugDTO";

import dayjs from "dayjs";
import { IntegrationManager } from "../integrations/integrationManager";

import { UserNotFoundError } from "../errors/UserError";
import { OrganizationNotFoundError } from "../errors/OrganizationError";
import { AppError } from "../errors/AppError";
import { logger } from "../utils/Logger";

/** Domain-scoped cache key builders for short-lived OAuth state (`login:`, `organization:`, `refresh:`, etc.). */
const CACHE_KEYS = {
    oauth: {
        login: (state: string) => `login:${state}`,
        organization: (state: string) => `organization:${state}`,
        refresh: (state: string) => `refresh:${state}`,
        onboarding: (state: string) => `onboarding:${state}`,
        external: (state: string) => `external:${state}`,
    },
} as const;

const OAUTH_STATE_TTL_SEC = 3600;

function rootInternalId(internalId: string): string | null {
    const parts = internalId.split("_");
    return parts.length > 1 ? (parts.pop() ?? null) : internalId;
}

/**
 * Default `posting_times` JSON for a new integration.
 *
 * Clients treat each `time` as minutes after **UTC** midnight, then render in the viewer’s zone
 * (`utc().startOf('day').add(time, 'minute').tz(...)`). The connect flow sends `timezone` as a numeric
 * **UTC offset in minutes** (browser `dayjs` `utcOffset()` on social connect).
 *
 * **560, 850, 1140** — naive “minutes since local midnight” for **09:20**, **14:10**, and **19:00**
 * (`9*60+20`, `14*60+10`, `19*60`). Subtracting `timezone` converts that intent into stored offsets for the anchor above.
 *
 * **120, 400, 700** — fallback when `timezone` is absent or not a number (not the 560/850/1140 preset).
 * As minutes after **UTC** midnight they are **02:00**, **06:40**, and **11:40** UTC on that anchor day;
 * the wall clock shown in the app depends on the viewer’s timezone (same decode as other `time` values).
 */
function postingTimesForTimezone(timezone?: number): string {
    if (timezone == null || Number.isNaN(timezone)) {
        return JSON.stringify([{ time: 120 }, { time: 400 }, { time: 700 }]);
    }
    return JSON.stringify([{ time: 560 - timezone }, { time: 850 - timezone }, { time: 1140 - timezone }]);
}

/**
 * OAuth, session membership checks, and list shaping via {@link IntegrationManager}.
 * Channel reads/writes go through {@link IntegrationService}; plug rules through {@link PlugService}.
 */
export class IntegrationConnectionService {
    constructor(
        private readonly integrations: IntegrationService,
        private readonly plugs: PlugService,
        private readonly organizationRepository: OrganizationRepository,
        private readonly manager: IntegrationManager,
        private readonly refreshIntegrationService: RefreshIntegrationService,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    private requireCache(): CacheService {
        if (!this.cache) {
            throw new AppError("Cache is required for OAuth integration flows", 503);
        }
        return this.cache;
    }

    /** Remove a transient OAuth key; prefers invalidator so deletion is counted like other domains. */
    private async invalidateOAuthCacheKey(key: string): Promise<void> {
        if (this.cacheInvalidator) {
            await this.cacheInvalidator.invalidateKey(key);
        } else if (this.cache) {
            await this.cache.del(key);
        }
    }

    private async resolveUserId(authUserId: string): Promise<string> {
        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
        if (!userId) throw new UserNotFoundError(authUserId);
        return userId;
    }

    async assertOrganizationMember(authUserId: string, organizationId: string): Promise<void> {
        const userId = await this.resolveUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) {
            throw new OrganizationNotFoundError(organizationId);
        }
    }

    async getIntegrationList(authUserId: string, organizationId: string) {
        await this.assertOrganizationMember(authUserId, organizationId);
        const rows = await this.integrations.listByOrganization(organizationId);
        const integrations = await Promise.all(rows.map((row) => this.mapListRow(row)));
        return { integrations };
    }

    async getIntegrationCustomers(authUserId: string, organizationId: string) {
        await this.assertOrganizationMember(authUserId, organizationId);
        return this.integrations.customers(organizationId);
    }

    async createIntegrationCustomer(authUserId: string, organizationId: string, name: string) {
        await this.assertOrganizationMember(authUserId, organizationId);
        return this.integrations.createIntegrationCustomer(organizationId, name);
    }

    async assignIntegrationCustomer(
        authUserId: string,
        organizationId: string,
        integrationId: string,
        customerId: string | null
    ): Promise<void> {
        await this.assertOrganizationMember(authUserId, organizationId);
        const row = await this.integrations.getById(organizationId, integrationId);
        if (!row) {
            throw new AppError("Integration not found", 404);
        }
        if (customerId !== null) {
            const customerRows = await this.integrations.customers(organizationId);
            if (!customerRows.some((c) => c.id === customerId)) {
                throw new AppError("Channel group not found", 404);
            }
        }
        await this.integrations.updateIntegrationGroup(organizationId, integrationId, customerId);
    }

    private async mapListRow(p: IntegrationLike) {
        const findIntegration = this.manager.getSocialIntegration(p.provider_identifier);
        const editor = findIntegration?.editor ?? "normal";
        let customFields: unknown;
        if (findIntegration?.customFields && typeof findIntegration.customFields === "function") {
            customFields = await findIntegration.customFields();
        }
        return {
            name: p.name,
            id: p.id,
            internalId: p.internal_id,
            disabled: p.disabled,
            editor,
            // Do not inject a placeholder path: the web uses provider icon fallbacks and a hardcoded
            // "/no-picture.jpg" path breaks avatar rendering (it is not guaranteed to exist on the web origin).
            picture: p.picture || null,
            identifier: p.provider_identifier,
            inBetweenSteps: p.in_between_steps,
            refreshNeeded: p.refresh_needed,
            isCustomFields: !!findIntegration?.customFields,
            ...(customFields !== undefined ? { customFields } : {}),
            display: p.profile,
            type: p.type,
            time: JSON.parse(p.posting_times || "[]"),
            changeProfilePicture: false,
            changeNickName: false,
            customer:
                p.customer_id && p.customer_name
                    ? { id: p.customer_id, name: p.customer_name }
                    : null,
            additionalSettings: p.additional_settings || "[]",
        };
    }

    private async buildOAuthAuthorizationUrl(
        organizationId: string,
        integration: string,
        opts: { refresh?: string; externalUrl?: string; onboarding?: string },
        externalUrlMessage: "session" | "public"
    ): Promise<{ url: string }> {
        if (!this.manager.getAllowedSocialsIntegrations().includes(integration)) {
            throw new AppError("Integration not allowed", 400);
        }

        const integrationProvider = this.manager.getSocialIntegration(integration);
        if (!integrationProvider) {
            throw new AppError("Integration not found", 404);
        }

        if (integrationProvider.externalUrl && !opts.externalUrl) {
            const msg =
                externalUrlMessage === "public"
                    ? "This integration requires an external URL and is not supported via the public API"
                    : "Missing external url";
            throw new AppError(msg, 400);
        }

        let clientInformation: ClientInformation | undefined;
        if (integrationProvider.externalUrl && opts.externalUrl) {
            clientInformation = {
                ...(await integrationProvider.externalUrl(opts.externalUrl)),
                instanceUrl: opts.externalUrl,
            };
        }

        const { codeVerifier, state, url } = await integrationProvider.generateAuthUrl(clientInformation);

        const cache = this.requireCache();
        if (opts.refresh) {
            await cache.set(CACHE_KEYS.oauth.refresh(state), opts.refresh, OAUTH_STATE_TTL_SEC);
        }
        if (opts.onboarding === "true") {
            await cache.set(CACHE_KEYS.oauth.onboarding(state), "true", OAUTH_STATE_TTL_SEC);
        }

        await cache.set(CACHE_KEYS.oauth.organization(state), organizationId, OAUTH_STATE_TTL_SEC);
        await cache.set(CACHE_KEYS.oauth.login(state), codeVerifier, OAUTH_STATE_TTL_SEC);
        if (clientInformation) {
            await cache.set(CACHE_KEYS.oauth.external(state), JSON.stringify(clientInformation), OAUTH_STATE_TTL_SEC);
        }

        return { url };
    }

    async getIntegrationUrl(
        authUserId: string,
        organizationId: string,
        integration: string,
        opts: { refresh?: string; externalUrl?: string; onboarding?: string }
    ): Promise<{ url: string } | { err: boolean }> {
        await this.assertOrganizationMember(authUserId, organizationId);

        try {
            return await this.buildOAuthAuthorizationUrl(organizationId, integration, opts, "session");
        } catch (err) {
            if (err instanceof AppError) throw err;
            return { err: true };
        }
    }

    async publicListIntegrations(organizationId: string) {
        const rows = await this.integrations.listByOrganization(organizationId);
        return rows.map((p) => ({
            id: p.id,
            name: p.name,
            identifier: p.provider_identifier,
            picture: p.picture || "/no-picture.jpg",
            disabled: p.disabled,
            profile: p.profile,
            customer:
                p.customer_id && p.customer_name
                    ? { id: p.customer_id, name: p.customer_name }
                    : null,
        }));
    }

    async getIntegrationUrlPublicApi(
        organizationId: string,
        integration: string,
        opts: { refresh?: string; externalUrl?: string; onboarding?: string }
    ): Promise<{ url: string }> {
        try {
            return await this.buildOAuthAuthorizationUrl(organizationId, integration, opts, "public");
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError("Failed to generate auth URL", 500);
        }
    }

    async publicDeleteChannel(organizationId: string, integrationId: string): Promise<void> {
        const row = await this.integrations.getById(organizationId, integrationId);
        if (!row) {
            throw new AppError("Integration not found", 404);
        }
        const deleted = await this.integrations.softDeleteChannel(organizationId, integrationId, row.internal_id);
        if (!deleted) {
            throw new AppError("Integration not found", 404);
        }
    }

    private async connectSocialMediaInternal(
        authUserId: string | null,
        integration: string,
        body: { state: string; code: string; timezone: string; refresh?: string }
    ) {
        if (!this.manager.getAllowedSocialsIntegrations().includes(integration)) {
            throw new AppError("Integration not allowed", 400);
        }

        const integrationProvider = this.manager.getSocialIntegration(integration);
        if (!integrationProvider) {
            throw new AppError("Integration not found", 404);
        }

        const cache = this.requireCache();

        const getCodeVerifier = integrationProvider.customFields
            ? "none"
            : ((await cache.get(CACHE_KEYS.oauth.login(body.state))) as string | null);
        if (!getCodeVerifier && !integrationProvider.customFields) {
            throw new AppError("Invalid state", 400);
        }

        if (!integrationProvider.customFields) {
            await this.invalidateOAuthCacheKey(CACHE_KEYS.oauth.login(body.state));
        }

        const organizationKey = CACHE_KEYS.oauth.organization(body.state);
        const organizationId = (await cache.get(organizationKey)) as string | null;
        if (!organizationId || typeof organizationId !== "string") {
            throw new AppError("Organization not found", 400);
        }

        if (authUserId) {
            await this.assertOrganizationMember(authUserId, organizationId);
        }

        const detailsRaw = await cache.get(CACHE_KEYS.oauth.external(body.state));
        if (detailsRaw) {
            await this.invalidateOAuthCacheKey(CACHE_KEYS.oauth.external(body.state));
        }

        const refreshState = (await cache.get(CACHE_KEYS.oauth.refresh(body.state))) as string | null;
        if (refreshState) await this.invalidateOAuthCacheKey(CACHE_KEYS.oauth.refresh(body.state));

        const onboarding = (await cache.get(CACHE_KEYS.oauth.onboarding(body.state))) as string | null;
        if (onboarding) await this.invalidateOAuthCacheKey(CACHE_KEYS.oauth.onboarding(body.state));

        let clientInformation: ClientInformation | undefined;
        if (detailsRaw && typeof detailsRaw === "string") {
            clientInformation = JSON.parse(detailsRaw) as ClientInformation;
        }

        const authResult = await this.safeAuthenticate(integrationProvider, body, getCodeVerifier ?? "none", clientInformation);

        if ("error" in authResult && !("accessToken" in authResult)) {
            throw new AppError((authResult as { error: string }).error, 400, { errorCode: "INTEGRATION_OAUTH_ERROR" });
        }

        const { accessToken, expiresIn, refreshToken, id, name, picture, username, additionalSettings } =
            authResult as AuthTokenDetails;

        if (!id) {
            throw new AppError("Invalid API key", 400);
        }

        if (refreshState && String(id) !== String(refreshState)) {
            throw new AppError("Please refresh the channel that needs to be refreshed", 400);
        }

        let validName = name;
        if (!validName) {
            if (username) {
                validName = username.split(".")[0] ?? username;
            } else {
                validName = `Channel_${String(id).slice(0, 8)}`;
            }
        }

        const tz = Number.parseInt(body.timezone, 10);
        const postingTimes = postingTimesForTimezone(Number.isNaN(tz) ? undefined : tz);

        const row = await this.integrations.upsertIntegration({
            organizationId,
            internalId: String(id),
            name: validName.trim(),
            picture: picture || null,
            providerIdentifier: integration,
            integrationType: "social",
            token: accessToken,
            refreshToken: refreshToken ?? "",
            expiresInSeconds: expiresIn,
            profile: username || null,
            inBetweenSteps: integrationProvider.isBetweenSteps ?? false,
            additionalSettingsJson: additionalSettings?.length
                ? JSON.stringify(additionalSettings)
                : "[]",
            customInstanceDetails: undefined,
            postingTimesJson: postingTimes,
            rootInternalId: rootInternalId(String(id)),
        });

        void this.refreshIntegrationService
            .startRefreshWorkflow(organizationId, row.id, integrationProvider)
            .catch((err) => {
                logger.debug({
                    msg: "startRefreshWorkflow failed",
                    error: err instanceof Error ? err.message : String(err),
                });
            });

        let pages: unknown[] = [];
        if (integrationProvider.isBetweenSteps && !refreshState) {
            const fetchPages =
                typeof integrationProvider.pages === "function" ? integrationProvider.pages.bind(integrationProvider) : null;
            if (fetchPages) {
                try {
                    pages = await fetchPages(accessToken);
                } catch {
                    pages = [];
                }
            }
        }

        const shouldKeepOrganizationState =
            !authUserId && Boolean(integrationProvider.isBetweenSteps) && !refreshState;
        if (!shouldKeepOrganizationState) {
            await this.invalidateOAuthCacheKey(organizationKey);
        }

        return {
            id: row.id,
            organizationId: row.organization_id,
            internalId: row.internal_id,
            name: row.name,
            picture: row.picture,
            providerIdentifier: row.provider_identifier,
            type: row.type,
            disabled: row.disabled,
            inBetweenSteps: row.in_between_steps,
            refreshNeeded: row.refresh_needed,
            onboarding: onboarding === "true",
            pages,
        };
    }

    async connectSocialMedia(
        authUserId: string,
        integration: string,
        body: { state: string; code: string; timezone: string; refresh?: string }
    ) {
        return this.connectSocialMediaInternal(authUserId, integration, body);
    }

    /** No-auth OAuth callback variant: organization comes from short-lived OAuth state cache. */
    async connectSocialMediaNoAuth(
        integration: string,
        body: { state: string; code: string; timezone: string; refresh?: string }
    ) {
        return this.connectSocialMediaInternal(null, integration, body);
    }

    private async safeAuthenticate(
        integrationProvider: {
            authenticate: (
                p: { code: string; codeVerifier: string; refresh?: string },
                c?: ClientInformation
            ) => Promise<AuthTokenDetails | string>;
        },
        body: { code: string; refresh?: string },
        codeVerifier: string,
        clientInformation?: ClientInformation
    ): Promise<AuthTokenDetails | { error: string }> {
        try {
            const auth = await integrationProvider.authenticate(
                {
                    code: body.code,
                    codeVerifier,
                    refresh: body.refresh,
                },
                clientInformation
            );

            if (typeof auth === "string") {
                return { error: auth };
            }

            if (auth.error) {
                return { error: auth.error };
            }

            return auth;
        } catch {
            return { error: "Authentication failed" };
        }
    }

    async setTimes(
        authUserId: string,
        organizationId: string,
        integrationId: string,
        body: IntegrationTimeDto
    ): Promise<void> {
        await this.assertOrganizationMember(authUserId, organizationId);
        const row = await this.integrations.getById(organizationId, integrationId);
        if (!row) throw new AppError("Integration not found", 404);
        await this.integrations.setPostingTimes(organizationId, integrationId, JSON.stringify(body.time));
    }

    async disableChannel(authUserId: string, organizationId: string, integrationId: string): Promise<void> {
        await this.assertOrganizationMember(authUserId, organizationId);
        const row = await this.integrations.getById(organizationId, integrationId);
        if (!row) throw new AppError("Integration not found", 404);
        await this.integrations.disableChannel(organizationId, integrationId);
    }

    async enableChannel(authUserId: string, organizationId: string, integrationId: string): Promise<void> {
        await this.assertOrganizationMember(authUserId, organizationId);
        const row = await this.integrations.getById(organizationId, integrationId);
        if (!row) throw new AppError("Integration not found", 404);
        await this.integrations.enableChannel(organizationId, integrationId);
    }

    async deleteChannel(authUserId: string, organizationId: string, integrationId: string): Promise<void> {
        await this.assertOrganizationMember(authUserId, organizationId);
        const row = await this.integrations.getById(organizationId, integrationId);
        if (!row) throw new AppError("Integration not found", 404);
        const deleted = await this.integrations.softDeleteChannel(organizationId, integrationId, row.internal_id);
        if (!deleted) throw new AppError("Integration not found", 404);
    }

    /**
     * Completes an integration stuck in `in_between_steps` using the provider's
     * {@link SocialProvider.fetchPageInformation} (same responsibility as a generic `saveProviderPage`).
     * For Instagram (Business), preserves the Facebook user access token in `refresh_token` and the
     * Facebook user id in `root_internal_id` so cron refresh can exchange and re-bind the page token.
     */
    async saveProviderPage(
        authUserId: string,
        organizationId: string,
        integrationId: string,
        body: Record<string, unknown>
    ): Promise<{ success: true }> {
        await this.assertOrganizationMember(authUserId, organizationId);
        return this.saveProviderPageForOrganization(organizationId, integrationId, body);
    }

    /** No-auth provider-page completion: organization is resolved from short-lived OAuth state cache. */
    async saveProviderPageNoAuth(
        integrationId: string,
        body: Record<string, unknown>
    ): Promise<{ success: true }> {
        const state = typeof body.state === "string" ? body.state : "";
        if (!state) {
            throw new AppError("Invalid state", 400);
        }
        const cache = this.requireCache();
        const organizationKey = CACHE_KEYS.oauth.organization(state);
        const organizationId = (await cache.get(organizationKey)) as string | null;
        if (!organizationId || typeof organizationId !== "string") {
            throw new AppError("Organization not found", 400);
        }
        const { state: _state, ...providerPayload } = body;
        const result = await this.saveProviderPageForOrganization(organizationId, integrationId, providerPayload);
        await this.invalidateOAuthCacheKey(organizationKey);
        return result;
    }

    /** Catalog of global (threshold) plugs for channels that support them. */
    getPlugCatalog() {
        return this.manager.listGlobalPlugCatalog();
    }

    /** Definitions for internal (post-compose) plugs for a provider slug (e.g. `threads`). */
    async getInternalPlugDefinitions(authUserId: string, organizationId: string, providerIdentifier: string) {
        await this.assertOrganizationMember(authUserId, organizationId);
        return { internalPlugs: this.manager.getInternalPlugDefinitionsForProvider(providerIdentifier) };
    }

    async listIntegrationPlugs(authUserId: string, organizationId: string, integrationId: string) {
        await this.assertOrganizationMember(authUserId, organizationId);
        const row = await this.integrations.getById(organizationId, integrationId);
        if (!row || row.deleted_at) {
            throw new AppError("Integration not found", 404);
        }
        return this.plugs.listIntegrationPlugs(organizationId, integrationId);
    }

    async upsertIntegrationPlug(authUserId: string, organizationId: string, integrationId: string, body: PlugUpsertBodyDto) {
        await this.assertOrganizationMember(authUserId, organizationId);
        const row = await this.integrations.getById(organizationId, integrationId);
        if (!row || row.deleted_at) {
            throw new AppError("Integration not found", 404);
        }
        const validationError = this.manager.validatePlugFieldsAgainstCatalog({
            providerIdentifier: row.provider_identifier,
            methodName: body.func,
            fields: body.fields,
        });
        if (validationError) {
            throw new AppError(validationError, 400);
        }
        if (body.plugId) {
            const existing = await this.plugs.getPlugRowById(body.plugId);
            if (!existing || existing.organization_id !== organizationId) {
                throw new AppError("Plug not found", 404);
            }
            if (existing.integration_id !== integrationId) {
                throw new AppError("Plug not found", 404);
            }
            if (existing.plug_function !== body.func) {
                throw new AppError("Plug type does not match request", 400);
            }
        }
        return this.plugs.upsertIntegrationPlug({
            organizationId,
            integrationId,
            plugFunction: body.func,
            dataJson: JSON.stringify(body.fields),
            plugId: body.plugId,
        });
    }

    async deleteIntegrationPlug(authUserId: string, organizationId: string, plugId: string) {
        await this.assertOrganizationMember(authUserId, organizationId);
        const plug = await this.plugs.getPlugRowById(plugId);
        if (!plug || plug.organization_id !== organizationId) {
            throw new AppError("Plug not found", 404);
        }
        const deleted = await this.plugs.deleteIntegrationPlug(organizationId, plugId);
        if (!deleted) {
            throw new AppError("Plug not found", 404);
        }
        return deleted;
    }

    async setIntegrationPlugActivated(authUserId: string, organizationId: string, plugId: string, activated: boolean) {
        await this.assertOrganizationMember(authUserId, organizationId);
        const plug = await this.plugs.getPlugRowById(plugId);
        if (!plug || plug.organization_id !== organizationId) {
            throw new AppError("Plug not found", 404);
        }
        const updated = await this.plugs.setIntegrationPlugActivated(organizationId, plugId, activated);
        if (!updated) {
            throw new AppError("Plug not found", 404);
        }
        return updated;
    }

    private async saveProviderPageForOrganization(
        organizationId: string,
        integrationId: string,
        body: Record<string, unknown>
    ): Promise<{ success: true }> {
        const row = await this.integrations.getById(organizationId, integrationId);
        if (!row) throw new AppError("Integration not found", 404);
        if (!row.in_between_steps) {
            throw new AppError("Integration does not need account selection", 400);
        }

        const provider = this.manager.getSocialIntegration(row.provider_identifier);
        if (!provider?.fetchPageInformation) {
            throw new AppError("Provider does not support page selection", 400);
        }

        const { organizationId: _org, ...providerPayload } = body;
        if (Object.keys(providerPayload).length === 0) {
            throw new AppError("Missing selection payload for this provider", 400);
        }

        const userAccessToken = row.token;
        const priorInternalId = row.internal_id;

        let information: FetchPageInformationResult;
        try {
            information = await provider.fetchPageInformation(userAccessToken, providerPayload);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Could not load selected account";
            throw new AppError(msg, 400);
        }

        const isInstagramBusiness = row.provider_identifier === "instagram-business";
        const refreshToken = isInstagramBusiness ? userAccessToken : row.refresh_token || "";
        const rootInternalId = isInstagramBusiness ? priorInternalId : row.root_internal_id;
        const expiresInSeconds = isInstagramBusiness ? dayjs().add(59, "days").unix() - dayjs().unix() : undefined;

        await this.integrations.updateIntegrationById(organizationId, integrationId, {
            internalId: String(information.id),
            name: (information.name ?? "").trim() || information.username || row.name,
            picture: information.picture || null,
            token: information.access_token,
            refreshToken,
            profile: information.username || null,
            inBetweenSteps: false,
            rootInternalId: rootInternalId ?? null,
            expiresInSeconds,
        });

        return { success: true };
    }
}
