import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

import { config } from "../../config/GlobalConfig";
import { UserTestHelper } from "../helpers/userTestHelper";

const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
const supabasePublishableKey = (config.supabase as { supabasePublishableKey?: string })
    .supabasePublishableKey;
const supabaseSecretKey = (config.supabase as { supabaseSecretKey?: string }).supabaseSecretKey;

const describeIfSupabase =
    supabaseUrl && supabasePublishableKey && supabaseSecretKey ? describe : describe.skip;

describeIfSupabase("public.users PostgREST hardening (integration)", () => {
    const userHelper = new UserTestHelper();

    afterEach(async () => {
        await userHelper.cleanAll();
    });

    it("denies anon SELECT on users (no email directory leak)", async () => {
        const anonClient = createClient(supabaseUrl!, supabasePublishableKey!);
        const { data, error } = await anonClient.from("users").select("email").limit(1);

        expect(error).toBeTruthy();
        expect(data).toBeNull();
    });

    it("denies authenticated UPDATE of is_super_admin via PostgREST", async () => {
        const userData = userHelper.setupTestUser1();
        const authUserId = randomUUID();
        await userHelper.createVerifiedUserWithAuthAndDatabase(
            { ...userData, id: authUserId },
            { isPlatformAdmin: false, isEmailVerified: true }
        );
        userHelper.trackUser(authUserId);

        const { data: signInData, error: signInError } = await createClient(
            supabaseUrl!,
            supabasePublishableKey!
        ).auth.signInWithPassword({
            email: userData.email,
            password: userData.password,
        });
        expect(signInError).toBeNull();
        const accessToken = signInData.session?.access_token;
        expect(accessToken).toBeDefined();

        const userClient = createClient(supabaseUrl!, supabasePublishableKey!, {
            global: { headers: { Authorization: `Bearer ${accessToken}` } },
        });

        const { data: updated, error: updateError } = await userClient
            .from("users")
            .update({ is_super_admin: true })
            .eq("auth_id", authUserId)
            .select("is_super_admin");

        expect(updateError).toBeTruthy();
        expect(updated).toBeNull();

        const adminClient = createClient(supabaseUrl!, supabaseSecretKey!);
        const { data: row } = await adminClient
            .from("users")
            .select("is_super_admin")
            .eq("auth_id", authUserId)
            .single();
        expect(row?.is_super_admin).toBe(false);
    });
});
