import { blueskyScheduledPublishHooks } from "../bluesky.js";
import { facebookScheduledPublishHooks } from "../facebook.js";
import { instagramScheduledPublishHooks } from "../instagram.js";
import { linkedinScheduledPublishHooks } from "../linkedin.js";
import { skoolScheduledPublishHooks } from "../skool.js";
import { threadsScheduledPublishHooks } from "../threads.js";
import { xScheduledPublishHooks } from "../x.js";
import { defaultScheduledPublishHooks } from "./defaultHooks.js";
import type { ScheduledPublishProviderHooks } from "./types.js";

const byIdentifier: Record<string, ScheduledPublishProviderHooks> = {
    threads: threadsScheduledPublishHooks,
    x: xScheduledPublishHooks,
    facebook: facebookScheduledPublishHooks,
    "linkedin": linkedinScheduledPublishHooks,
    "linkedin-page": linkedinScheduledPublishHooks,
    bluesky: blueskyScheduledPublishHooks,
    skool: skoolScheduledPublishHooks,
    "instagram-business": instagramScheduledPublishHooks,
    "instagram-standalone": instagramScheduledPublishHooks,
};

function capitalizeProviderFallback(id: string): string {
    const t = id.trim();
    if (!t) return t;
    return t[0].toUpperCase() + t.slice(1);
}

export function resolveScheduledPublishHooks(providerIdentifier: string): ScheduledPublishProviderHooks {
    const pid = providerIdentifier.trim().toLowerCase();
    if (pid.startsWith("instagram")) {
        return instagramScheduledPublishHooks;
    }
    return byIdentifier[pid] ?? defaultScheduledPublishHooks;
}

export function providerDisplayName(providerIdentifier: string): string {
    const hooks = resolveScheduledPublishHooks(providerIdentifier);
    if (hooks.displayName.trim()) return hooks.displayName;
    return capitalizeProviderFallback(providerIdentifier);
}
