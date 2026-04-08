import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/table-types";
import { createSupabaseServiceClient } from "./supabase";
import { cacheService, cacheInvalidationService } from "./cache";

let supabaseServiceClientSingleton: SupabaseClient<Database> | undefined;

/** Lazily create the service client so a missing env does not crash module load (e.g. Vercel cold start). */
export function getSupabaseServiceClient(): SupabaseClient<Database> {
	if (!supabaseServiceClientSingleton) {
		supabaseServiceClientSingleton = createSupabaseServiceClient();
	}
	return supabaseServiceClientSingleton;
}

export const supabaseServiceClientConnection = new Proxy({} as SupabaseClient<Database>, {
	get(_target, prop, receiver) {
		const client = getSupabaseServiceClient();
		const value = Reflect.get(client, prop, receiver);
		if (typeof value === "function") {
			return (value as (...a: unknown[]) => unknown).bind(client);
		}
		return value;
	},
});
export const cacheServiceConnection = cacheService;
export const cacheInvalidationServiceConnection = cacheInvalidationService;
export { Sentry } from "./sentry/index";
export { cacheService, cacheInvalidationService } from "./cache";
export { createQueueIoredisClient, getQueueRedisConnectionOptions } from "./bullmq";
