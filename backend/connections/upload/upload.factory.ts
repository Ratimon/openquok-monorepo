import { config } from "../../config/GlobalConfig";

import type { StorageR2Repository } from "../../repositories/StorageR2Repository";
import { LocalStorage } from "./local.storage";
import { R2Storage } from "./r2.storage";
import type { IUploadProvider } from "./upload.interface";

export class UploadFactory {
    static createStorage(storageR2Repository: StorageR2Repository): IUploadProvider {
        const storageCfg = config.storage as
            | { provider?: string; local?: { uploadDirectory?: string }; r2?: unknown }
            | undefined;
        const provider = String(storageCfg?.provider ?? "r2").toLowerCase();

        if (provider === "local") {
            const dir = String(storageCfg?.local?.uploadDirectory ?? "");
            return new LocalStorage(dir);
        }
        return new R2Storage(storageR2Repository);
    }
}

