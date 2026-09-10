import { describe, expect, it, jest } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerUploadFromUrlTool } from "./uploadFromUrl";

jest.mock("../media/uploadProgrammaticMediaFromUrl", () => ({
    uploadProgrammaticMediaFromUrl: jest.fn(),
}));

import { uploadProgrammaticMediaFromUrl } from "../media/uploadProgrammaticMediaFromUrl";

const uploadMock = uploadProgrammaticMediaFromUrl as jest.MockedFunction<typeof uploadProgrammaticMediaFromUrl>;

describe("uploadFromUrl MCP tool", () => {
    it("uploads media from a URL", async () => {
        uploadMock.mockResolvedValue({ id: "media-1", path: "org/media-1.jpg" });
        const run = captureMcpToolHandler("uploadFromUrl", registerUploadFromUrlTool, {
            mediaUploadDeps: {},
        });

        const result = await run({ url: "https://cdn.example.com/banner.png" });

        expect(uploadMock).toHaveBeenCalledWith(
            "org-1",
            "https://cdn.example.com/banner.png",
            {}
        );
        expect(result.structuredContent).toEqual({ id: "media-1", path: "org/media-1.jpg" });
    });

    it("requires url", async () => {
        const run = captureMcpToolHandler("uploadFromUrl", registerUploadFromUrlTool, {
            mediaUploadDeps: {},
        });

        await expect(run({ url: "" })).rejects.toThrow("url is required");
    });
});
