/// <reference types="jest" />
import { faker } from "@faker-js/faker";

import type { TrialBrowserRepository } from "../repositories/TrialBrowserRepository";
import type { UserRepository } from "../repositories/UserRepository";
import { TrialBrowserService } from "./TrialBrowserService";

jest.mock("../config/GlobalConfig", () => ({
    config: {
        stripe: { publishableKey: "pk_test" },
    },
}));

describe("TrialBrowserService", () => {
    let repository: jest.Mocked<
        Pick<TrialBrowserRepository, "hasBrowserConsumedTrial" | "recordBrowserTrialConsumption">
    >;
    let userRepository: jest.Mocked<
        Pick<
            UserRepository,
            "findUserIdByAuthId" | "updateCloudTrialBrowserSignalId" | "getCloudTrialBrowserSignalId"
        >
    >;

    beforeEach(() => {
        repository = {
            hasBrowserConsumedTrial: jest.fn().mockResolvedValue(false),
            recordBrowserTrialConsumption: jest.fn().mockResolvedValue(undefined),
        };
        userRepository = {
            findUserIdByAuthId: jest.fn(),
            updateCloudTrialBrowserSignalId: jest.fn().mockResolvedValue(undefined),
            getCloudTrialBrowserSignalId: jest.fn(),
        };
    });

    function service(): TrialBrowserService {
        return new TrialBrowserService(
            repository as unknown as TrialBrowserRepository,
            userRepository as unknown as UserRepository
        );
    }

    it("normalizeSignal rejects non-uuid values", () => {
        expect(service().normalizeSignal("not-a-uuid")).toBeNull();
        expect(service().normalizeSignal(faker.string.uuid())).toMatch(
            /^[0-9a-f-]{36}$/i
        );
    });

    it("hasBrowserConsumedTrial delegates to repository when billing is enabled", async () => {
        const signal = faker.string.uuid();
        repository.hasBrowserConsumedTrial.mockResolvedValue(true);
        await expect(service().hasBrowserConsumedTrial(signal)).resolves.toBe(true);
        expect(repository.hasBrowserConsumedTrial).toHaveBeenCalledWith(signal);
    });

    it("persistUserBrowserSignal resolves auth id and updates user row", async () => {
        const authUserId = faker.string.uuid();
        const publicUserId = faker.string.uuid();
        const signal = faker.string.uuid();
        userRepository.findUserIdByAuthId.mockResolvedValue({ userId: publicUserId, error: null });

        await service().persistUserBrowserSignal(authUserId, signal);

        expect(userRepository.updateCloudTrialBrowserSignalId).toHaveBeenCalledWith(publicUserId, signal);
    });
});
