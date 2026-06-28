import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { config } from "../../config/GlobalConfig";

const supabaseConfig = config.supabase as { supabaseUrl: string; supabaseSecretKey?: string };

export class ListingTestHelper {
    private adminSupabase: SupabaseClient;

    /** Listing IDs created during tests; cleared after cleanTrackedListingData(). */
    public createdListingIds: string[] = [];

    /** Category IDs created during tests; cleared after cleanTrackedListingData(). */
    public createdCategoryIds: string[] = [];

    /** Tag IDs created during tests; cleared after cleanTrackedListingData(). */
    public createdTagIds: string[] = [];

    constructor(adminSupabase?: SupabaseClient) {
        if (adminSupabase) {
            this.adminSupabase = adminSupabase;
        } else {
            const url = supabaseConfig.supabaseUrl;
            const key = supabaseConfig.supabaseSecretKey;
            if (!url || !key) {
                throw new Error("Supabase URL and secret key required for ListingTestHelper");
            }
            this.adminSupabase = createClient(url, key);
        }
    }

    trackListing(listingId: string): void {
        this.createdListingIds.push(listingId);
    }

    trackCategory(categoryId: string): void {
        this.createdCategoryIds.push(categoryId);
    }

    trackTag(tagId: string): void {
        this.createdTagIds.push(tagId);
    }

    /** Set a public username on a user (required for GET /creators). */
    async setUserUsername(userId: string, username: string): Promise<void> {
        const { error } = await this.adminSupabase
            .from("users")
            .update({ username })
            .eq("id", userId);
        if (error) {
            throw new Error(`Failed to set username: ${error.message}`);
        }
    }

    /**
     * Delete tracked listings, categories, and tags (FK-safe order), then clear tracked ids.
     * Use in afterAll of listing integration tests so the DB is left clean.
     */
    async cleanTrackedListingData(): Promise<void> {
        if (this.createdListingIds.length > 0) {
            try {
                await this.adminSupabase.from("listings").delete().in("id", this.createdListingIds);
            } catch {
                // ignore cleanup errors
            }
            this.createdListingIds = [];
        }
        if (this.createdTagIds.length > 0) {
            try {
                await this.adminSupabase.from("listing_tags").delete().in("id", this.createdTagIds);
            } catch {
                // ignore cleanup errors
            }
            this.createdTagIds = [];
        }
        if (this.createdCategoryIds.length > 0) {
            try {
                await this.adminSupabase.from("listing_categories").delete().in("id", this.createdCategoryIds);
            } catch {
                // ignore cleanup errors
            }
            this.createdCategoryIds = [];
        }
    }
}
