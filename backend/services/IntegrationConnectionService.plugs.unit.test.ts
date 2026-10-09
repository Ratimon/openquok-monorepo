import { faker } from "@faker-js/faker";
import { IntegrationManager } from "../integrations/integrationManager";
import { OrganizationForbiddenError } from "../errors/OrganizationError";
import {
    authUserId,
    orgId,
    integrationId,
    userId,
    sampleRow,
    activeMembershipRow,
    mockFindUserIdByAuthIdResult,
    mockFindMembershipResult,
    createIntegrationConnectionHarness,
} from "./integrationConnectionService.unit.harness";

const plugCatalog = new IntegrationManager();

describe("IntegrationConnectionService.plugs", () => {
    let harness = createIntegrationConnectionHarness({ plugCatalog });

    beforeEach(() => {
        harness = createIntegrationConnectionHarness({ plugCatalog });
    });

        const plugId = faker.string.uuid();

        function mockActiveMember() {
            harness.orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            harness.orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
        }

        it("getPlugCatalog returns threads global plugs shape", () => {
            const out = harness.service().getPlugCatalog();
            expect(out.plugs.map((p) => p.identifier)).toContain("threads");
            const threadsEntry = out.plugs.find((p) => p.identifier === "threads");
            expect(threadsEntry?.plugs.some((g) => g.methodName === "autoPlugPost")).toBe(true);
        });

        it("getPlugCatalog returns bluesky global plugs shape", () => {
            const out = harness.service().getPlugCatalog();
            expect(out.plugs.map((p) => p.identifier)).toContain("bluesky");
            const blueskyEntry = out.plugs.find((p) => p.identifier === "bluesky");
            expect(blueskyEntry?.plugs.some((g) => g.methodName === "autoRepostPost")).toBe(true);
            expect(blueskyEntry?.plugs.some((g) => g.methodName === "autoPlugPost")).toBe(true);
        });

        it("getInternalPlugDefinitions requires membership and returns Threads internal plugs", async () => {
            mockActiveMember();
            const out = await harness.service().getInternalPlugDefinitions(authUserId, orgId, "threads");
            expect(out.internalPlugs.some((p) => p.methodName === "threadsInternalFollowUp")).toBe(true);
        });

        it("getInternalPlugDefinitions throws OrganizationForbiddenError when not a member", async () => {
            harness.orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            harness.orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(null));
            await expect(harness.service().getInternalPlugDefinitions(authUserId, orgId, "threads")).rejects.toBeInstanceOf(
                OrganizationForbiddenError
            );
        });

        it("listIntegrationPlugs delegates after integration exists", async () => {
            mockActiveMember();
            harness.integrations.getById.mockResolvedValue(sampleRow());
            const rows = [{ id: plugId, organization_id: orgId, integration_id: integrationId, plug_function: "autoPlugPost", data: "{}", activated: true }];
            harness.plugs.listIntegrationPlugs.mockResolvedValue(rows);
            const out = await harness.service().listIntegrationPlugs(authUserId, orgId, integrationId);
            expect(out).toBe(rows);
            expect(harness.plugs.listIntegrationPlugs).toHaveBeenCalledWith(orgId, integrationId);
        });

        it("listIntegrationPlugs throws 404 when integration missing", async () => {
            mockActiveMember();
            harness.integrations.getById.mockResolvedValue(null);
            await expect(harness.service().listIntegrationPlugs(authUserId, orgId, integrationId)).rejects.toMatchObject({
                statusCode: 404,
                message: "Integration not found",
            });
        });

        it("listIntegrationPlugs throws 404 when integration soft-deleted", async () => {
            mockActiveMember();
            harness.integrations.getById.mockResolvedValue(sampleRow({ deleted_at: new Date().toISOString() }));
            await expect(harness.service().listIntegrationPlugs(authUserId, orgId, integrationId)).rejects.toMatchObject({
                statusCode: 404,
            });
        });

        it("upsertIntegrationPlug validates fields and delegates", async () => {
            mockActiveMember();
            harness.integrations.getById.mockResolvedValue(sampleRow({ provider_identifier: "threads" }));
            const newId = faker.string.uuid();
            harness.plugs.upsertIntegrationPlug.mockResolvedValue({ id: newId, activated: true });
            const body = {
                func: "autoPlugPost",
                fields: [
                    { name: "likesAmount", value: "10" },
                    { name: "post", value: "Hello world" },
                ],
            };
            const out = await harness.service().upsertIntegrationPlug(authUserId, orgId, integrationId, body);
            expect(out).toEqual({ id: newId, activated: true });
            expect(harness.plugs.upsertIntegrationPlug).toHaveBeenCalledWith({
                organizationId: orgId,
                integrationId,
                plugFunction: "autoPlugPost",
                dataJson: JSON.stringify(body.fields),
                plugId: undefined,
            });
        });

        it("upsertIntegrationPlug with plugId checks existing row then delegates", async () => {
            mockActiveMember();
            const plugId = faker.string.uuid();
            harness.integrations.getById.mockResolvedValue(sampleRow({ provider_identifier: "threads" }));
            harness.plugs.getPlugRowById.mockResolvedValue({
                id: plugId,
                organization_id: orgId,
                integration_id: integrationId,
                plug_function: "autoPlugPost",
                data: "{}",
                activated: true,
            });
            harness.plugs.upsertIntegrationPlug.mockResolvedValue({ id: plugId, activated: true });
            const body = {
                plugId,
                func: "autoPlugPost",
                fields: [
                    { name: "likesAmount", value: "5" },
                    { name: "post", value: "Updated" },
                ],
            };
            const out = await harness.service().upsertIntegrationPlug(authUserId, orgId, integrationId, body);
            expect(out).toEqual({ id: plugId, activated: true });
            expect(harness.plugs.getPlugRowById).toHaveBeenCalledWith(plugId);
            expect(harness.plugs.upsertIntegrationPlug).toHaveBeenCalledWith({
                organizationId: orgId,
                integrationId,
                plugFunction: "autoPlugPost",
                dataJson: JSON.stringify(body.fields),
                plugId,
            });
        });

        it("upsertIntegrationPlug throws 404 when plugId row belongs to another integration", async () => {
            mockActiveMember();
            const plugId = faker.string.uuid();
            harness.integrations.getById.mockResolvedValue(sampleRow({ provider_identifier: "threads" }));
            harness.plugs.getPlugRowById.mockResolvedValue({
                id: plugId,
                organization_id: orgId,
                integration_id: faker.string.uuid(),
                plug_function: "autoPlugPost",
                data: "{}",
                activated: true,
            });
            await expect(
                harness.service().upsertIntegrationPlug(authUserId, orgId, integrationId, {
                    plugId,
                    func: "autoPlugPost",
                    fields: [
                        { name: "likesAmount", value: "1" },
                        { name: "post", value: "abc def ghi" },
                    ],
                })
            ).rejects.toMatchObject({ statusCode: 404 });
            expect(harness.plugs.upsertIntegrationPlug).not.toHaveBeenCalled();
        });

        it("upsertIntegrationPlug throws 400 when plug unknown for provider", async () => {
            mockActiveMember();
            harness.integrations.getById.mockResolvedValue(sampleRow({ provider_identifier: "threads" }));
            await expect(
                harness.service().upsertIntegrationPlug(authUserId, orgId, integrationId, {
                    func: "noSuchPlug",
                    fields: [{ name: "x", value: "y" }],
                })
            ).rejects.toMatchObject({ statusCode: 400 });
            expect(harness.plugs.upsertIntegrationPlug).not.toHaveBeenCalled();
        });

        it("upsertIntegrationPlug throws 404 when integration missing", async () => {
            mockActiveMember();
            harness.integrations.getById.mockResolvedValue(null);
            await expect(
                harness.service().upsertIntegrationPlug(authUserId, orgId, integrationId, {
                    func: "autoPlugPost",
                    fields: [
                        { name: "likesAmount", value: "1" },
                        { name: "post", value: "abc" },
                    ],
                })
            ).rejects.toMatchObject({ statusCode: 404 });
        });

        it("setIntegrationPlugActivated returns id when plug belongs to org", async () => {
            mockActiveMember();
            harness.plugs.getPlugRowById.mockResolvedValue({
                id: plugId,
                organization_id: orgId,
                integration_id: integrationId,
                plug_function: "autoPlugPost",
                data: "{}",
                activated: true,
            });
            harness.plugs.setIntegrationPlugActivated.mockResolvedValue({ id: plugId });
            const out = await harness.service().setIntegrationPlugActivated(authUserId, orgId, plugId, false);
            expect(out).toEqual({ id: plugId });
            expect(harness.plugs.setIntegrationPlugActivated).toHaveBeenCalledWith(orgId, plugId, false);
        });

        it("setIntegrationPlugActivated throws 404 when plug row missing", async () => {
            mockActiveMember();
            harness.plugs.getPlugRowById.mockResolvedValue(null);
            await expect(
                harness.service().setIntegrationPlugActivated(authUserId, orgId, plugId, true)
            ).rejects.toMatchObject({ statusCode: 404, message: "Plug not found" });
        });

        it("setIntegrationPlugActivated throws 404 when plug belongs to another org", async () => {
            mockActiveMember();
            harness.plugs.getPlugRowById.mockResolvedValue({
                id: plugId,
                organization_id: faker.string.uuid(),
                integration_id: integrationId,
                plug_function: "autoPlugPost",
                data: "{}",
                activated: true,
            });
            await expect(
                harness.service().setIntegrationPlugActivated(authUserId, orgId, plugId, true)
            ).rejects.toMatchObject({ statusCode: 404, message: "Plug not found" });
            expect(harness.plugs.setIntegrationPlugActivated).not.toHaveBeenCalled();
        });

        it("setIntegrationPlugActivated throws 404 when service update returns null", async () => {
            mockActiveMember();
            harness.plugs.getPlugRowById.mockResolvedValue({
                id: plugId,
                organization_id: orgId,
                integration_id: integrationId,
                plug_function: "autoPlugPost",
                data: "{}",
                activated: true,
            });
            harness.plugs.setIntegrationPlugActivated.mockResolvedValue(null);
            await expect(
                harness.service().setIntegrationPlugActivated(authUserId, orgId, plugId, true)
            ).rejects.toMatchObject({ statusCode: 404, message: "Plug not found" });
        });

        it("deleteIntegrationPlug delegates when plug belongs to org", async () => {
            mockActiveMember();
            harness.plugs.getPlugRowById.mockResolvedValue({
                id: plugId,
                organization_id: orgId,
                integration_id: integrationId,
                plug_function: "autoPlugPost",
                data: "{}",
                activated: true,
            });
            harness.plugs.deleteIntegrationPlug.mockResolvedValue({ id: plugId });
            const out = await harness.service().deleteIntegrationPlug(authUserId, orgId, plugId);
            expect(out).toEqual({ id: plugId });
            expect(harness.plugs.deleteIntegrationPlug).toHaveBeenCalledWith(orgId, plugId);
        });

        it("deleteIntegrationPlug throws 404 when plug missing", async () => {
            mockActiveMember();
            harness.plugs.getPlugRowById.mockResolvedValue(null);
            await expect(harness.service().deleteIntegrationPlug(authUserId, orgId, plugId)).rejects.toMatchObject({
                statusCode: 404,
                message: "Plug not found",
            });
            expect(harness.plugs.deleteIntegrationPlug).not.toHaveBeenCalled();
        });

        it("publicListIntegrationPlugs skips membership and delegates", async () => {
            harness.integrations.getById.mockResolvedValue(sampleRow());
            const rows = [{ id: plugId, organization_id: orgId, integration_id: integrationId, plug_function: "autoPlugPost", data: "{}", activated: true }];
            harness.plugs.listIntegrationPlugs.mockResolvedValue(rows);
            const out = await harness.service().publicListIntegrationPlugs(orgId, integrationId);
            expect(out).toBe(rows);
            expect(harness.orgRepo.findMembership).not.toHaveBeenCalled();
        });

        it("publicUpsertIntegrationPlug validates and delegates without membership", async () => {
            harness.integrations.getById.mockResolvedValue(sampleRow());
            harness.plugs.upsertIntegrationPlug.mockResolvedValue({ id: plugId, activated: true });
            const body = {
                func: "autoPlugPost",
                fields: [
                    { name: "likesAmount", value: "10" },
                    { name: "post", value: "Thanks for the love!" },
                ],
            };
            const out = await harness.service().publicUpsertIntegrationPlug(orgId, integrationId, body);
            expect(out).toEqual({ id: plugId, activated: true });
            expect(harness.orgRepo.findMembership).not.toHaveBeenCalled();
        });
});
