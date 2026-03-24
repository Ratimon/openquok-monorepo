import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import { config } from "../../config/GlobalConfig";

const supabaseConfig = config.supabase as { supabaseUrl: string; supabaseServiceRoleKey?: string };

export class UserTestHelper {
    private adminSupabase: SupabaseClient;
    public createdUserIds: string[] = [];

    constructor() {
        const url = supabaseConfig.supabaseUrl;
        const key = supabaseConfig.supabaseServiceRoleKey;
        if (!url || !key) {
            throw new Error("Supabase URL and service role key required for UserTestHelper");
        }
        this.adminSupabase = createClient(url, key);
    }

    private async deleteBlogPostsForUserIds(userIds: string[]): Promise<void> {
        if (!userIds.length) return;
        try {
            await this.adminSupabase.from("blog_posts").delete().in("user_id", userIds);
        } catch {
            // ignore cleanup errors
        }
    }

    private async deleteOrganizationsForUserIds(userIds: string[]): Promise<void> {
        if (!userIds.length) return;
        try {
            const { data: memberships } = await this.adminSupabase
                .from("user_organizations")
                .select("organization_id")
                .in("user_id", userIds);
            const organizationIds = Array.from(
                new Set((memberships ?? []).map((m) => m.organization_id).filter(Boolean))
            ) as string[];
            if (!organizationIds.length) return;
            await this.adminSupabase.from("organizations").delete().in("id", organizationIds);
        } catch {
            // ignore cleanup errors
        }
    }

    /** Delete organization_invites for the given emails (e.g. test users being cleaned). */
    private async deleteOrganizationInvitesForEmails(emails: string[]): Promise<void> {
        if (!emails.length) return;
        try {
            const lowerEmails = emails.map((e) => e?.trim().toLowerCase()).filter(Boolean);
            for (const email of lowerEmails) {
                await this.adminSupabase.from("organization_invites").delete().ilike("email", email);
            }
        } catch {
            // ignore cleanup errors
        }
    }

    /** Delete organization_invites where email matches test patterns (@test.com, @example.com). */
    private async deleteOrganizationInvitesByEmailPattern(): Promise<void> {
        try {
            await this.adminSupabase
                .from("organization_invites")
                .delete()
                .or("email.ilike.%@test.com,email.ilike.%@example.com");
        } catch {
            // ignore cleanup errors
        }
    }

    /** Return a test user payload (no auth/db created; signup will create them). */
    setupTestUser1(): { email: string; password: string; fullName: string } {
        // Supabase Auth / public.users store email lowercased; match that so assertions stay stable.
        return {
            email: `testuser-${faker.string.alphanumeric(8)}-${Date.now()}@test.com`.toLowerCase(),
            password: "Test1234!",
            fullName: faker.person.fullName(),
        };
    }

    /**
     * Create a verified test user with Supabase Auth and public.users record (Listing-style).
     * Trigger creates public.users with id = auth.id; we then set is_super_admin / is_email_verified.
     * @returns userData plus publicId (same as id in content-os trigger).
     */
    async createVerifiedUserWithAuthAndDatabase(
        userData: {
            id: string;
            email: string;
            password: string;
            fullName: string;
        },
        options: { isSuperAdmin?: boolean; isEmailVerified?: boolean } = {}
    ): Promise<{ id: string; email: string; password: string; fullName: string; publicId: string }> {
        this.trackUser(userData.id);

        try {
            await this.adminSupabase.auth.admin.createUser({
                id: userData.id,
                email: userData.email,
                password: userData.password,
                email_confirm: true,
                user_metadata: { full_name: userData.fullName },
            });
        } catch (authErr: unknown) {
            const msg = authErr instanceof Error ? authErr.message : String(authErr);
            if (!msg.includes("already registered") && !msg.includes("User already registered")) {
                throw new Error(`Failed to create auth user: ${msg}`);
            }
        }
        await new Promise((r) => setTimeout(r, 200));

        const isSuperAdmin = options.isSuperAdmin === true;
        const updatePayload: { is_super_admin: boolean; is_email_verified?: boolean } = {
            is_super_admin: isSuperAdmin,
        };
        if (options.isEmailVerified === true) updatePayload.is_email_verified = true;
        const { data: updated, error } = await this.adminSupabase
            .from("users")
            .update(updatePayload)
            .eq("id", userData.id)
            .select("id, is_super_admin")
            .single();
        if (error) throw new Error(`Failed to update test user flags: ${error.message}`);
        if (!updated) throw new Error("No row updated for test user (trigger may not have created public.users)");
        if (updated.is_super_admin !== isSuperAdmin) {
            throw new Error(
                `Test user is_super_admin mismatch: expected ${isSuperAdmin}, got ${updated.is_super_admin}`
            );
        }

        return { ...userData, publicId: userData.id };
    }

    trackUser(userId: string): void {
        this.createdUserIds.push(userId);
    }

    async cleanAllStoredUsers(): Promise<void> {
        if (!this.createdUserIds.length) return;
        const authIds = Array.from(new Set(this.createdUserIds.filter(Boolean)));

        // Support both schemas:
        // - public.users.id = auth.users.id (common trigger pattern)
        // - public.users.auth_id = auth.users.id (older pattern)
        const rows: Array<{ id: string; auth_id?: string | null; email?: string | null }> = [];
        try {
            const { data: byId } = await this.adminSupabase
                .from("users")
                .select("id, auth_id, email")
                .in("id", authIds);
            rows.push(...(byId ?? []));
        } catch {
            // ignore
        }
        try {
            const { data: byAuthId } = await this.adminSupabase
                .from("users")
                .select("id, auth_id, email")
                .in("auth_id", authIds);
            rows.push(...(byAuthId ?? []));
        } catch {
            // ignore
        }

        const userIds = Array.from(new Set(rows.map((r) => r.id).filter(Boolean)));
        const emails = Array.from(
            new Set(rows.map((r) => (r.email ?? "").trim()).filter(Boolean))
        );

        await this.deleteBlogPostsForUserIds(userIds);
        await this.deleteOrganizationsForUserIds(userIds);
        await this.deleteOrganizationInvitesForEmails(emails);

        // Delete auth users and their corresponding public.users rows (best-effort).
        for (const authId of authIds) {
            try {
                await this.adminSupabase.auth.admin.deleteUser(authId);
            } catch {
                // ignore
            }
            try {
                await this.adminSupabase.from("users").delete().eq("auth_id", authId);
            } catch {
                // ignore
            }
            try {
                await this.adminSupabase.from("users").delete().eq("id", authId);
            } catch {
                // ignore
            }
        }
        if (userIds.length) {
            try {
                await this.adminSupabase.from("users").delete().in("id", userIds);
            } catch {
                // ignore
            }
        }
        this.createdUserIds = [];
    }

    /** Delete auth and public.users for test emails (@test.com, @example.com). */
    async cleanTestUsersByEmailPattern(): Promise<void> {
        await this.deleteOrganizationInvitesByEmailPattern();
        const { data: rows } = await this.adminSupabase
            .from("users")
            .select("id, auth_id")
            .or("email.ilike.%@test.com,email.ilike.%@example.com");
        const userIds = (rows ?? []).map((row) => row.id).filter(Boolean);
        if (userIds.length) {
            await this.deleteBlogPostsForUserIds(userIds);
            await this.deleteOrganizationsForUserIds(userIds);
            for (const row of rows ?? []) {
                if (row.auth_id) {
                    try {
                        await this.adminSupabase.auth.admin.deleteUser(row.auth_id);
                    } catch {
                        // ignore
                    }
                }
            }
            for (const row of rows ?? []) {
                if (row.id) {
                    await this.adminSupabase.from("users").delete().eq("id", row.id);
                }
            }
        }
        const { data: authUsers } = await this.adminSupabase.auth.admin.listUsers();
        for (const user of authUsers?.users ?? []) {
            if (user.email?.includes("@test.com") || user.email?.includes("@example.com")) {
                try {
                    await this.adminSupabase.auth.admin.deleteUser(user.id);
                } catch {
                    // ignore
                }
            }
        }
    }

    /**
     * Run all cleanup in one call: stored users (with blog_posts), then test users by email pattern.
     * Use in afterAll of a test suite to leave the DB clean.
     */
    async cleanAll(): Promise<void> {
        await this.cleanAllStoredUsers();
        await this.cleanTestUsersByEmailPattern();
    }
}
