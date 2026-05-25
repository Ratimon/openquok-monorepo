import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { config } from "../../config/GlobalConfig";

const TEST_EMAIL_OR = "email.ilike.%@test.com,email.ilike.%@example.com";

/** Workspace names created by e2e helpers (not real user workspaces). */
const TEST_ORG_NAME_PREFIXES = ["E2E Posts "] as const;

export type TestDatabaseCleanupResult = {
    organizationIds: string[];
    testUserIds: string[];
};

function isTestDbCleanupSkipped(): boolean {
    const flag = (process.env.OPENQUOK_SKIP_TEST_DB_CLEANUP ?? "").trim().toLowerCase();
    return flag === "1" || flag === "true" || flag === "yes";
}

export function canRunTestDatabaseCleanup(): boolean {
    // Jest scripts use NODE_ENV=development; only skip in production.
    if (process.env.NODE_ENV === "production") return false;
    if (isTestDbCleanupSkipped()) return false;
    const supabase = config.supabase as { supabaseUrl?: string; supabaseSecretKey?: string };
    return Boolean(supabase.supabaseUrl?.trim() && supabase.supabaseSecretKey?.trim());
}

export function createAdminSupabaseForTests(): SupabaseClient {
    const supabase = config.supabase as { supabaseUrl: string; supabaseSecretKey: string };
    const url = supabase.supabaseUrl?.trim();
    const key = supabase.supabaseSecretKey?.trim();
    if (!url || !key) {
        throw new Error("Supabase URL and secret key required for test database cleanup");
    }
    return createClient(url, key);
}

async function listTestUserRows(
    adminSupabase: SupabaseClient
): Promise<Array<{ id: string; auth_id?: string | null; email?: string | null }>> {
    const { data: rows, error } = await adminSupabase
        .from("users")
        .select("id, auth_id, email")
        .or(TEST_EMAIL_OR);
    if (error) {
        throw new Error(`Failed to list test users for cleanup: ${error.message}`);
    }
    return rows ?? [];
}

async function organizationIdsForUserIds(
    adminSupabase: SupabaseClient,
    userIds: string[]
): Promise<string[]> {
    if (!userIds.length) return [];
    const { data: memberships, error } = await adminSupabase
        .from("user_organizations")
        .select("organization_id")
        .in("user_id", userIds);
    if (error) {
        throw new Error(`Failed to list test organization memberships: ${error.message}`);
    }
    return Array.from(
        new Set((memberships ?? []).map((m) => m.organization_id).filter(Boolean))
    ) as string[];
}

async function organizationIdsByE2ENamePrefix(adminSupabase: SupabaseClient): Promise<string[]> {
    const ids: string[] = [];
    for (const prefix of TEST_ORG_NAME_PREFIXES) {
        const { data: rows, error } = await adminSupabase
            .from("organizations")
            .select("id")
            .ilike("name", `${prefix}%`);
        if (error) {
            throw new Error(`Failed to list organizations by test name prefix: ${error.message}`);
        }
        for (const row of rows ?? []) {
            if (row.id) ids.push(row.id);
        }
    }
    return Array.from(new Set(ids));
}

async function organizationIdsWithNoMembers(adminSupabase: SupabaseClient): Promise<string[]> {
    const { data: orgs, error: orgErr } = await adminSupabase.from("organizations").select("id");
    if (orgErr) {
        throw new Error(`Failed to list organizations for orphan cleanup: ${orgErr.message}`);
    }
    const { data: memberships, error: memErr } = await adminSupabase
        .from("user_organizations")
        .select("organization_id");
    if (memErr) {
        throw new Error(`Failed to list memberships for orphan cleanup: ${memErr.message}`);
    }
    const memberOrgIds = new Set(
        (memberships ?? []).map((m) => m.organization_id).filter(Boolean) as string[]
    );
    return (orgs ?? []).map((o) => o.id).filter((id) => id && !memberOrgIds.has(id)) as string[];
}

async function deleteOrganizationsByIds(
    adminSupabase: SupabaseClient,
    organizationIds: string[]
): Promise<void> {
    if (!organizationIds.length) return;
    const { error } = await adminSupabase.from("organizations").delete().in("id", organizationIds);
    if (error) {
        throw new Error(`Failed to delete test organizations: ${error.message}`);
    }
}

async function deleteBlogPostsForUserIds(
    adminSupabase: SupabaseClient,
    userIds: string[]
): Promise<void> {
    if (!userIds.length) return;
    const { error } = await adminSupabase.from("blog_posts").delete().in("user_id", userIds);
    if (error) {
        throw new Error(`Failed to delete test blog posts: ${error.message}`);
    }
}

async function deleteOrganizationInvitesForTestEmails(adminSupabase: SupabaseClient): Promise<void> {
    const { error } = await adminSupabase
        .from("organization_invites")
        .delete()
        .or("email.ilike.%@test.com,email.ilike.%@example.com");
    if (error) {
        throw new Error(`Failed to delete test organization invites: ${error.message}`);
    }
}

async function deleteAuthUsersByIds(adminSupabase: SupabaseClient, authIds: string[]): Promise<void> {
    for (const authId of authIds) {
        try {
            await adminSupabase.auth.admin.deleteUser(authId);
        } catch {
            // best-effort: user may already be gone
        }
    }
}

async function deletePublicUsersByIds(adminSupabase: SupabaseClient, userIds: string[]): Promise<void> {
    if (!userIds.length) return;
    const { error } = await adminSupabase.from("users").delete().in("id", userIds);
    if (error) {
        throw new Error(`Failed to delete test public.users rows: ${error.message}`);
    }
}

/**
 * Removes organizations and users created by integration/e2e tests.
 * Safe for local dev DBs: only targets @test.com / @example.com users, e2e org name prefixes,
 * and memberless orphan organizations (left when user cleanup failed).
 */
export async function cleanTestOrganizationsAndUsers(
    adminSupabase: SupabaseClient
): Promise<TestDatabaseCleanupResult> {
    const testUsers = await listTestUserRows(adminSupabase);
    const testUserIds = Array.from(new Set(testUsers.map((u) => u.id).filter(Boolean)));

    const orgIdSet = new Set<string>();
    for (const id of await organizationIdsForUserIds(adminSupabase, testUserIds)) {
        orgIdSet.add(id);
    }
    for (const id of await organizationIdsByE2ENamePrefix(adminSupabase)) {
        orgIdSet.add(id);
    }
    for (const id of await organizationIdsWithNoMembers(adminSupabase)) {
        orgIdSet.add(id);
    }

    const organizationIds = Array.from(orgIdSet);

    await deleteOrganizationInvitesForTestEmails(adminSupabase);
    await deleteBlogPostsForUserIds(adminSupabase, testUserIds);
    await deleteOrganizationsByIds(adminSupabase, organizationIds);

    const authIds = Array.from(
        new Set(testUsers.map((u) => u.auth_id ?? u.id).filter(Boolean) as string[])
    );
    await deleteAuthUsersByIds(adminSupabase, authIds);
    await deletePublicUsersByIds(adminSupabase, testUserIds);

    // Auth users that exist only in auth.users (signup tracked late / failed public.users)
    const { data: authList } = await adminSupabase.auth.admin.listUsers();
    for (const user of authList?.users ?? []) {
        const email = user.email ?? "";
        if (email.includes("@test.com") || email.includes("@example.com")) {
            try {
                await adminSupabase.auth.admin.deleteUser(user.id);
            } catch {
                // ignore
            }
        }
    }

    return { organizationIds, testUserIds };
}

/** Runs before the full Jest run when Supabase test credentials are configured. */
export async function runTestDatabaseCleanupBeforeAllTests(): Promise<TestDatabaseCleanupResult | null> {
    if (!canRunTestDatabaseCleanup()) return null;
    const adminSupabase = createAdminSupabaseForTests();
    return cleanTestOrganizationsAndUsers(adminSupabase);
}
