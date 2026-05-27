import { faker } from "@faker-js/faker";
import { SubscriptionSection, type SubscriptionPolicy } from "openquok-common";
import type { SubscriptionGuardService } from "../subscription/SubscriptionGuardService";
import { PermissionsService } from "./PermissionsService";

describe("PermissionsService facade", () => {
    const authUserId = faker.string.uuid();
    const organizationId = faker.string.uuid();

    it("delegates assertCanCreateWorkspace to subscriptionGuard", async () => {
        const subscriptionGuard = {
            assertCanCreateWorkspace: jest.fn().mockResolvedValue(undefined),
        } as unknown as SubscriptionGuardService;
        const service = new PermissionsService(subscriptionGuard);

        await service.assertCanCreateWorkspace(authUserId);

        expect(subscriptionGuard.assertCanCreateWorkspace).toHaveBeenCalledWith(authUserId);
    });

    it("delegates assertPolicies to subscriptionGuard", async () => {
        const subscriptionGuard = {
            assertPolicies: jest.fn().mockResolvedValue(undefined),
        } as unknown as SubscriptionGuardService;
        const service = new PermissionsService(subscriptionGuard);
        const policies: SubscriptionPolicy[] = [["create", SubscriptionSection.PUBLIC_API]];

        await service.assertPolicies(organizationId, "owner", policies, authUserId);

        expect(subscriptionGuard.assertPolicies).toHaveBeenCalledWith(
            organizationId,
            "owner",
            policies,
            authUserId
        );
    });

    it("delegates assertPostsPerMonthAllowed to subscriptionGuard", async () => {
        const subscriptionGuard = {
            assertPostsPerMonthAllowed: jest.fn().mockResolvedValue(undefined),
        } as unknown as SubscriptionGuardService;
        const service = new PermissionsService(subscriptionGuard);

        await service.assertPostsPerMonthAllowed(organizationId, 2, authUserId);

        expect(subscriptionGuard.assertPostsPerMonthAllowed).toHaveBeenCalledWith(
            organizationId,
            2,
            authUserId
        );
    });
});
