import type { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseEntityNotFoundError, DatabaseError } from "../errors/InfraError";

/**
 * ConfigRepository – reads from `public.module_configs`.
 *
 * Schema source of truth: backend/supabase/db/config/
 *   - 104_20251117_tables.sql   – table definition (module_name, config JSONB, updated_at)
 *   - 302_20251117_rlsgrants.sql – RLS (read all; write super_admin only)
 *   - 501_20251117_seed.sql    – seed rows (company_information, marketing_information, landing_page, user_auth)
 *
 * Aggregated into: backend/supabase/migrations/ (core_structure).
 */

export interface ModuleConfigRow {
    module_name: string;
    config: Record<string, unknown>;
    updated_at: string;
}

export class ConfigRepository {
    public static readonly TABLE_NAME_MODULE_CONFIGS = "module_configs";
    public static readonly FULL_CONFIG_PARAMS = `
        module_name,
        config,
        updated_at
    `;

    constructor(private readonly supabaseServiceClient: SupabaseClient) {}

    public async getConfigByModuleName(moduleName: string): Promise<{ data: ModuleConfigRow }> {
        const { data, error } = await this.supabaseServiceClient
            .from(ConfigRepository.TABLE_NAME_MODULE_CONFIGS)
            .select(ConfigRepository.FULL_CONFIG_PARAMS)
            .eq("module_name", moduleName)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(
                `Error in getConfigByModuleName: ${moduleName} with message ${error.message}`,
                {
                    cause: error as unknown as Error,
                    operation: "getConfigByModuleName",
                    resource: { type: "table", name: ConfigRepository.TABLE_NAME_MODULE_CONFIGS },
                }
            );
        }

        if (!data) {
            throw new DatabaseEntityNotFoundError(
                ConfigRepository.TABLE_NAME_MODULE_CONFIGS,
                { moduleName }
            );
        }

        return { data: data as ModuleConfigRow };
    }

    public async getConfigByModuleNameAndProperty(params: {
        moduleName: string;
        property: string;
    }): Promise<{ result: string }> {
        const { moduleName, property } = params;
        const { data, error } = await this.supabaseServiceClient
            .from(ConfigRepository.TABLE_NAME_MODULE_CONFIGS)
            .select(ConfigRepository.FULL_CONFIG_PARAMS)
            .eq("module_name", moduleName)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(
                `Error in getConfigByModuleNameAndProperty: ${moduleName} with message ${error.message}`,
                {
                    cause: error as unknown as Error,
                    operation: "getConfigByModuleNameAndProperty",
                    resource: { type: "table", name: ConfigRepository.TABLE_NAME_MODULE_CONFIGS },
                }
            );
        }

        const config = data?.config as Record<string, unknown> | null | undefined;
        if (!data || !config || config[property] === undefined) {
            throw new DatabaseEntityNotFoundError(
                ConfigRepository.TABLE_NAME_MODULE_CONFIGS,
                { moduleName, property }
            );
        }

        return { result: String(config[property]) };
    }

    public async getConfigByModuleNameAndProperties(params: {
        moduleName: string;
        properties: string[];
    }): Promise<{ result: Record<string, string>; error: Error | null }> {
        const { moduleName, properties } = params;
        let result: Record<string, string> = {};

        const { data, error } = await this.supabaseServiceClient
            .from(ConfigRepository.TABLE_NAME_MODULE_CONFIGS)
            .select(ConfigRepository.FULL_CONFIG_PARAMS)
            .eq("module_name", moduleName)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(
                `Error in getConfigByModuleNameAndProperties: ${moduleName} with message ${error.message}`,
                {
                    cause: error as unknown as Error,
                    operation: "getConfigByModuleNameAndProperties",
                    resource: { type: "table", name: ConfigRepository.TABLE_NAME_MODULE_CONFIGS },
                }
            );
        }

        if (!data) {
            throw new DatabaseEntityNotFoundError(
                ConfigRepository.TABLE_NAME_MODULE_CONFIGS,
                { moduleName }
            );
        }

        const config = data.config as Record<string, unknown> | null | undefined;
        if (config && properties.length > 0) {
            for (const key of properties) {
                if (key in config && config[key] != null) {
                    result[key] = String(config[key]);
                }
            }
        }

        return { result, error: null };
    }

    public async updateConfigByModuleName(params: {
        moduleName: string;
        newConfig: Record<string, unknown>;
    }): Promise<boolean> {
        const { moduleName, newConfig } = params;
        const { error } = await this.supabaseServiceClient
            .from(ConfigRepository.TABLE_NAME_MODULE_CONFIGS)
            .update({ config: newConfig })
            .eq("module_name", moduleName);

        if (error) {
            throw new DatabaseError(
                `Error in updateConfigByModuleName: ${moduleName} with message ${error.message}`,
                {
                    cause: error as unknown as Error,
                    operation: "updateConfigByModuleName",
                    resource: { type: "table", name: ConfigRepository.TABLE_NAME_MODULE_CONFIGS },
                }
            );
        }

        return true;
    }
}
