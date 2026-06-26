import fs from "node:fs";
import FormData from "form-data";
import fetch from "node-fetch";

import type { OpenquokConfig } from "./config";
import { requestJson } from "./http";

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

  async uploadFile(filePath: string): Promise<unknown> {
    if (!this.cfg.apiKey) {
      throw new Error("Not authenticated: set OPENQUOK_API_KEY or run `openquok auth:login`");
    }

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
      const err: any = new Error(`Upload failed: ${res.status} ${res.statusText}`);
      err.status = res.status;
      err.body = parsed;
      throw err;
    }

    return parsed;
  }
}

