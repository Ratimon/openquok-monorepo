import type { SupabaseClient } from "@supabase/supabase-js";

import { DATABASE_NAMES, StorageSupabaseRepository } from "./StorageSupabaseRepository";

function createStorageMock(listRows: { name: string }[], uploadError: null | { message: string } = null) {
    const upload = jest.fn().mockResolvedValue({ error: uploadError });
    const list = jest.fn().mockResolvedValue({ data: listRows, error: null });
    const from = jest.fn(() => ({ upload, list }));

    const supabase = { storage: { from } } as unknown as SupabaseClient;
    return { supabase, upload, list, from };
}

describe("StorageSupabaseRepository.uploadImageUnderPrefix", () => {
    it("uploads under the prefix using a sanitized original filename", async () => {
        const { supabase, upload } = createStorageMock([]);
        const repo = new StorageSupabaseRepository(supabase);
        const buffer = Buffer.from("img");

        const filePath = await repo.uploadImageUnderPrefix(
            DATABASE_NAMES.AUTO_LAUNCH_PROFILE_MEDIA,
            { buffer, originalname: "My Tool Shot.png", mimetype: "image/png" },
            "org-1/profile-2"
        );

        expect(filePath).toBe("org-1/profile-2/My Tool Shot.png");
        expect(upload).toHaveBeenCalledWith(
            "org-1/profile-2/My Tool Shot.png",
            buffer,
            expect.objectContaining({ contentType: "image/png", upsert: false })
        );
    });

    it("adds a numeric suffix before the extension when the basename already exists", async () => {
        const { supabase, upload } = createStorageMock([{ name: "hero.png" }, { name: "hero-2.png" }]);
        const repo = new StorageSupabaseRepository(supabase);
        const buffer = Buffer.from("img");

        const filePath = await repo.uploadImageUnderPrefix(
            DATABASE_NAMES.AUTO_LAUNCH_PROFILE_MEDIA,
            { buffer, originalname: "hero.png", mimetype: "image/png" },
            "org-1/profile-2"
        );

        expect(filePath).toBe("org-1/profile-2/hero-3.png");
        expect(upload).toHaveBeenCalledWith(
            "org-1/profile-2/hero-3.png",
            buffer,
            expect.objectContaining({ contentType: "image/png" })
        );
    });
});