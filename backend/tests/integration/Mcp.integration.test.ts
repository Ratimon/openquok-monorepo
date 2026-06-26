import http from "http";

import supertest from "supertest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn as sharedSignupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import {
    exchangeOAuthProgrammaticToken,
    programmaticBearerAuth,
} from "../helpers/programmaticAuthTestHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    prepareSoloWorkspace,
    restoreSoloWorkspaceSpies,
    type SoloWorkspaceSpies,
} from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const settingsPath = `${apiPrefix}/settings`;

const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
const supabaseSecretKey = (config.supabase as { supabaseSecretKey?: string }).supabaseSecretKey;
const describeIfSupabase = supabaseUrl && supabaseSecretKey ? describe : describe.skip;

describeIfSupabase("Hosted MCP auth + tools/list (integration)", () => {
    const userHelper = new UserTestHelper();

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;
    let soloWorkspaceSpies: SoloWorkspaceSpies | undefined;
    let server: http.Server | undefined;
    let serverUrl: string | undefined;

    beforeAll(async () => {
        verificationToken = generateRandomVerificationToken();
        getVerificationTokenSpy = jest
            .spyOn(EmailService.prototype, "generateVerificationToken")
            .mockImplementation(() => verificationToken);
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);

        server = http.createServer(app);
        await new Promise<void>((resolve) => {
            server!.listen(0, "127.0.0.1", () => resolve());
        });
        const address = server.address();
        if (!address || typeof address === "string") {
            throw new Error("Failed to start MCP integration test server");
        }
        serverUrl = `http://127.0.0.1:${address.port}`;
    });

    afterAll(async () => {
        if (server) {
            await new Promise<void>((resolve, reject) => {
                server!.close((error) => (error ? reject(error) : resolve()));
            });
        }
        await userHelper.cleanAll();
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    beforeEach(() => {
        soloWorkspaceSpies = prepareSoloWorkspace();
    });

    afterEach(async () => {
        restoreSoloWorkspaceSpies(soloWorkspaceSpies);
        soloWorkspaceSpies = undefined;
        await cleanupIntegrationTestUsers(userHelper);
    });

    async function createWorkspaceWithOAuthToken(): Promise<{ bearerToken: string; orgId: string }> {
        const payload = userHelper.setupTestUser1();
        const { accessToken } = await sharedSignupVerifyAndSignIn(
            app,
            userHelper,
            authPath,
            verificationToken,
            payload
        );

        const settingsRes = await supertest(app)
            .get(settingsPath)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(settingsRes.status).toBe(200);

        const orgId = settingsRes.body?.data?.[0]?.id as string;
        expect(orgId).toBeDefined();

        const bearerToken = await exchangeOAuthProgrammaticToken(accessToken, orgId);
        return { bearerToken, orgId };
    }

    it("returns 401 when no API key is sent to /mcp", async () => {
        const res = await supertest(app)
            .post("/mcp")
            .set("Accept", "application/json, text/event-stream")
            .send({
                jsonrpc: "2.0",
                id: "init-no-auth",
                method: "initialize",
                params: {
                    protocolVersion: "2025-03-26",
                    capabilities: {},
                    clientInfo: { name: "jest", version: "1.0.0" },
                },
            });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ msg: "No API key provided" });
    });

    it("returns 401 when an invalid API key is sent to /mcp", async () => {
        const res = await supertest(app)
            .post("/mcp")
            .set("Accept", "application/json, text/event-stream")
            .set(programmaticBearerAuth("opo_invalid_programmatic_token"))
            .send({
                jsonrpc: "2.0",
                id: "init-invalid-auth",
                method: "initialize",
                params: {
                    protocolVersion: "2025-03-26",
                    capabilities: {},
                    clientInfo: { name: "jest", version: "1.0.0" },
                },
            });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ msg: "Invalid API key" });
    });

    it("lists v1 tools over hosted MCP with a valid opo_ bearer token", async () => {
        const { bearerToken } = await createWorkspaceWithOAuthToken();
        const client = new Client({ name: "mcp-integration-test", version: "1.0.0" });
        const transport = new StreamableHTTPClientTransport(new URL("/mcp", serverUrl), {
            requestInit: {
                headers: programmaticBearerAuth(bearerToken),
            },
        });

        try {
            await client.connect(transport);

            const result = await client.request(
                {
                    method: "tools/list",
                    params: {},
                },
                ListToolsResultSchema
            );

            const toolNames = result.tools.map((tool) => tool.name).sort();
            expect(toolNames).toEqual([
                "groupList",
                "integrationList",
                "integrationSchema",
                "schedulePostTool",
                "triggerTool",
            ]);
        } finally {
            await transport.close();
            await client.close();
        }
    });
});
