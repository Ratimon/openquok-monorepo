import type { SupabaseClient } from "@supabase/supabase-js";

import { config } from "../config/GlobalConfig";
import { IntegrationRepository } from "./IntegrationRepository";
import {
    decryptIntegrationSecret,
    encryptIntegrationSecret,
    isEncryptedIntegrationSecret,
} from "../utils/auth/integrationTokenCrypto";

describe("IntegrationRepository token encrypt-at-rest", () => {
    const key = "repo-unit-token-encryption-key";
    let integrationsCfg: { tokenEncryptionKey?: string };
    let fromMock: jest.Mock;
    let upsertMock: jest.Mock;
    let selectMock: jest.Mock;
    let singleMock: jest.Mock;
    let repo: IntegrationRepository;

    beforeEach(() => {
        integrationsCfg = config.integrations as { tokenEncryptionKey?: string };
        integrationsCfg.tokenEncryptionKey = key;

        singleMock = jest.fn();
        selectMock = jest.fn(() => ({ single: singleMock }));
        upsertMock = jest.fn(() => ({ select: selectMock }));
        fromMock = jest.fn(() => ({ upsert: upsertMock }));

        const supabase = { from: fromMock } as unknown as SupabaseClient;
        repo = new IntegrationRepository(supabase);
    });

    afterEach(() => {
        integrationsCfg.tokenEncryptionKey = "";
    });

    it("encrypts token and refresh_token on upsert and returns decrypted row", async () => {
        singleMock.mockResolvedValue({
            data: {
                id: "int-1",
                organization_id: "org-1",
                internal_id: "u1",
                name: "Ada",
                picture: null,
                provider_identifier: "devto",
                type: "article",
                token: encryptIntegrationSecret("plain-access", key),
                refresh_token: encryptIntegrationSecret("plain-refresh", key),
                token_expiration: null,
                profile: null,
                in_between_steps: false,
                refresh_needed: false,
                deleted_at: null,
                posting_times: "[]",
                custom_instance_details: null,
                additional_settings: "[]",
                root_internal_id: null,
            },
            error: null,
        });

        const out = await repo.upsertIntegration({
            organizationId: "org-1",
            internalId: "u1",
            name: "Ada",
            providerIdentifier: "devto",
            integrationType: "article",
            token: "plain-access",
            refreshToken: "plain-refresh",
            inBetweenSteps: false,
            additionalSettingsJson: "[]",
            postingTimesJson: "[]",
            rootInternalId: null,
        });

        const written = upsertMock.mock.calls[0][0] as { token: string; refresh_token: string | null };
        expect(isEncryptedIntegrationSecret(written.token)).toBe(true);
        expect(isEncryptedIntegrationSecret(written.refresh_token)).toBe(true);
        expect(decryptIntegrationSecret(written.token, key)).toBe("plain-access");
        expect(decryptIntegrationSecret(written.refresh_token, key)).toBe("plain-refresh");
        expect(out.token).toBe("plain-access");
        expect(out.refresh_token).toBe("plain-refresh");
    });
});
