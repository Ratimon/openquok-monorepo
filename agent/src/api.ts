import fs from "node:fs";
import FormData from "form-data";
import fetch from "node-fetch";

import type { OpenquokConfig } from "./config";
import {
  MEDIA_MULTIPART_PART_BYTES,
  hostedUploadTooLargeMessage,
  mimeFromFilePath,
  multipartPartNumbers,
  shouldUseMultipartUpload,
} from "./commands/upload.logic";
import { HttpError, requestJson } from "./http";

function apiBase(apiUrl: string): string {
  return apiUrl.replace(/\/+$/, "") + "/api/v1";
}

export class OpenquokApi {
  constructor(private readonly cfg: OpenquokConfig) {}

  private url(pathname: string): string {
    return apiBase(this.cfg.apiUrl) + pathname;
  }

  async isConnected(): Promise<unknown> {
    return await requestJson({ url: this.url("/public/is-connected"), apiKey: this.cfg.apiKey });
  }

  async getWorkspace(): Promise<{ workspace: { id: string; name: string } }> {
    return await requestJson({
      url: this.url("/public/workspace"),
      apiKey: this.cfg.apiKey,
    });
  }

  async listIntegrations(group?: string): Promise<unknown> {
    const u = new URL(this.url("/public/integrations"));
    if (group?.trim()) {
      u.searchParams.set("group", group.trim());
    }
    return await requestJson({ url: u.toString(), apiKey: this.cfg.apiKey });
  }

  async listGroups(): Promise<unknown> {
    return await requestJson({ url: this.url("/public/groups"), apiKey: this.cfg.apiKey });
  }

  async getIntegrationSettings(id: string): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/integration-settings/${encodeURIComponent(id)}`),
      apiKey: this.cfg.apiKey,
    });
  }

  async getPlugCatalog(): Promise<unknown> {
    return await requestJson({
      url: this.url("/public/plug-catalog"),
      apiKey: this.cfg.apiKey,
    });
  }

  async listIntegrationPlugs(integrationId: string): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/integration-plugs/${encodeURIComponent(integrationId)}`),
      apiKey: this.cfg.apiKey,
    });
  }

  async upsertIntegrationPlug(
    integrationId: string,
    body: { func: string; fields: { name: string; value: string }[]; plugId?: string }
  ): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/integration-plugs/${encodeURIComponent(integrationId)}`),
      apiKey: this.cfg.apiKey,
      method: "POST",
      body,
    });
  }

  async deleteIntegrationPlug(plugId: string): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/plugs/${encodeURIComponent(plugId)}`),
      apiKey: this.cfg.apiKey,
      method: "DELETE",
    });
  }

  async setIntegrationPlugActivated(plugId: string, activated: boolean): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/plugs/${encodeURIComponent(plugId)}/activate`),
      apiKey: this.cfg.apiKey,
      method: "PUT",
      body: { activated },
    });
  }

  async triggerIntegrationTool(
    id: string,
    methodName: string,
    data: Record<string, unknown>
  ): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/integration-trigger/${encodeURIComponent(id)}`),
      apiKey: this.cfg.apiKey,
      method: "POST",
      body: { methodName, data },
    });
  }

  async listPosts(params: {
    start: string;
    end: string;
    integrationIds?: string;
    /** `integration_customers.id` (channel group) for this workspace. */
    customerGroupId?: string;
  }): Promise<unknown> {
    const u = new URL(this.url("/public/posts/list"));
    u.searchParams.set("start", params.start);
    u.searchParams.set("end", params.end);
    if (params.integrationIds) u.searchParams.set("integrationIds", params.integrationIds);
    if (params.customerGroupId) u.searchParams.set("customerGroupId", params.customerGroupId);
    return await requestJson({ url: u.toString(), apiKey: this.cfg.apiKey });
  }

  async createPost(body: unknown): Promise<unknown> {
    return await requestJson({ url: this.url("/public/posts"), apiKey: this.cfg.apiKey, method: "POST", body });
  }


  async updatePostReviewTodo(
    postId: string,
    body: { note?: string | null; isReviewed?: boolean; isAgent?: boolean }
  ): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/posts/${encodeURIComponent(postId)}/review-todo`),
      apiKey: this.cfg.apiKey,
      method: "PUT",
      body,
    });
  }

  async flipPostStatus(postId: string, status: "draft" | "scheduled"): Promise<unknown> {
    const body = status === "draft" ? { status: "draft" as const } : { status: "scheduled" as const };
    return await requestJson({
      url: this.url(`/public/posts/${encodeURIComponent(postId)}/status`),
      apiKey: this.cfg.apiKey,
      method: "PUT",
      body,
    });
  }

  async deletePost(postId: string): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/posts/${encodeURIComponent(postId)}`),
      apiKey: this.cfg.apiKey,
      method: "DELETE",
    });
  }

  async getMissingContent(postId: string): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/posts/${encodeURIComponent(postId)}/missing`),
      apiKey: this.cfg.apiKey,
    });
  }

  async updateReleaseId(postId: string, releaseId: string): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/posts/${encodeURIComponent(postId)}/release-id`),
      apiKey: this.cfg.apiKey,
      method: "PUT",
      body: { releaseId },
    });
  }

  async getIntegrationAnalytics(integrationId: string, date: 7 | 30 | 90): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/analytics/${encodeURIComponent(integrationId)}?date=${date}`),
      apiKey: this.cfg.apiKey,
    });
  }

  async getPostAnalytics(postId: string, date: 7 | 30 | 90): Promise<unknown> {
    return await requestJson({
      url: this.url(`/public/analytics/post/${encodeURIComponent(postId)}?date=${date}`),
      apiKey: this.cfg.apiKey,
    });
  }

  async uploadFromUrl(urlToFetch: string): Promise<unknown> {
    return await requestJson({
      url: this.url("/public/upload-from-url"),
      apiKey: this.cfg.apiKey,
      method: "POST",
      body: { url: urlToFetch },
    });
  }

  async createMultipartUpload(body: {
    fileName: string;
    contentType?: string;
    fileSize?: number;
  }): Promise<{ success: boolean; data: { uploadId: string; key: string } }> {
    return await requestJson({
      url: this.url("/public/upload/create-multipart"),
      apiKey: this.cfg.apiKey,
      method: "POST",
      body,
    });
  }

  async signMultipartParts(body: {
    key: string;
    uploadId: string;
    partNumbers: number[];
  }): Promise<{ success: boolean; data: { urls: Record<string, string> } }> {
    return await requestJson({
      url: this.url("/public/upload/sign-parts"),
      apiKey: this.cfg.apiKey,
      method: "POST",
      body,
    });
  }

  async completeMultipartUpload(body: {
    key: string;
    uploadId: string;
    fileName: string;
    contentType?: string;
    fileSize: number;
    parts: Array<{ ETag: string; PartNumber: number }>;
  }): Promise<unknown> {
    return await requestJson({
      url: this.url("/public/upload/complete-multipart"),
      apiKey: this.cfg.apiKey,
      method: "POST",
      body,
    });
  }

  async abortMultipartUpload(body: { key: string; uploadId: string }): Promise<unknown> {
    return await requestJson({
      url: this.url("/public/upload/abort-multipart"),
      apiKey: this.cfg.apiKey,
      method: "POST",
      body,
    });
  }

  async uploadFile(filePath: string): Promise<unknown> {
    if (!this.cfg.apiKey) {
      throw new Error("Not authenticated: set OPENQUOK_API_KEY or run `openquok auth:login`");
    }

    const stat = fs.statSync(filePath);
    if (shouldUseMultipartUpload(stat.size)) {
      try {
        return await this.uploadFileViaMultipart(filePath, stat.size);
      } catch (error) {
        if (error instanceof HttpError && error.status === 501) {
          return await this.uploadFileDirect(filePath);
        }
        throw error;
      }
    }

    try {
      return await this.uploadFileDirect(filePath);
    } catch (error) {
      const status = (error as { status?: number })?.status;
      if (status === 413) {
        return await this.uploadFileViaMultipart(filePath, stat.size);
      }
      throw error;
    }
  }

  private async uploadFileDirect(filePath: string): Promise<unknown> {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const res = await fetch(this.url("/public/upload"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.cfg.apiKey}`,
        // form-data sets content-type boundary itself
        ...(form.getHeaders() as Record<string, string>),
        Accept: "application/json",
      },
      body: form as any,
    });

    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      const err: any = new Error(hostedUploadTooLargeMessage(res.status));
      if (res.status !== 413) {
        err.message = `Upload failed: ${res.status} ${res.statusText}`;
      }
      err.status = res.status;
      err.body = parsed;
      throw err;
    }

    return parsed;
  }

  private async uploadFileViaMultipart(filePath: string, fileSize: number): Promise<unknown> {
    const fileName = filePath.split(/[/\\]/).pop() || "upload.bin";
    const contentType = mimeFromFilePath(filePath);
    const created = await this.createMultipartUpload({ fileName, contentType, fileSize });
    const { key, uploadId } = created.data;
    const partNumbers = multipartPartNumbers(fileSize);

    try {
      const signed = await this.signMultipartParts({ key, uploadId, partNumbers });
      const completedParts: Array<{ ETag: string; PartNumber: number }> = [];
      const fh = await fs.promises.open(filePath, "r");
      try {
        for (const partNumber of partNumbers) {
          const start = (partNumber - 1) * MEDIA_MULTIPART_PART_BYTES;
          const length = Math.min(MEDIA_MULTIPART_PART_BYTES, fileSize - start);
          const buf = Buffer.alloc(length);
          await fh.read(buf, 0, length, start);
          const url = signed.data.urls[String(partNumber)];
          if (!url) {
            throw new Error(`Missing signed URL for part ${partNumber}`);
          }
          const putRes = await fetch(url, { method: "PUT", body: buf });
          if (!putRes.ok) {
            throw new Error(`Part upload failed: ${putRes.status} ${putRes.statusText}`);
          }
          const rawEtag = putRes.headers.get("etag") ?? putRes.headers.get("ETag") ?? "";
          const etag = String(rawEtag).replace(/^"+|"+$/g, "");
          if (!etag) {
            throw new Error("Part upload missing ETag");
          }
          completedParts.push({ ETag: etag, PartNumber: partNumber });
        }
      } finally {
        await fh.close();
      }

      return await this.completeMultipartUpload({
        key,
        uploadId,
        fileName,
        contentType,
        fileSize,
        parts: completedParts,
      });
    } catch (error) {
      await this.abortMultipartUpload({ key, uploadId }).catch(() => undefined);
      throw error;
    }
  }
}

