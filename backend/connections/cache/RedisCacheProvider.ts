import { createClient, type RedisClientType } from "redis";
import { logger } from "../../utils/Logger";

interface RedisCacheOptions {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    prefix?: string;
    enableOfflineQueue?: boolean;
    useScan?: boolean;
    maxReconnectAttempts?: number;
}

class RedisCacheProvider {
    private options: {
        host: string;
        port: number;
        password?: string;
        db: number;
        prefix: string;
        enableOfflineQueue: boolean;
        useScan: boolean;
        maxReconnectAttempts: number;
    };
    private client: RedisClientType | null = null;
    private isConnected = false;

    constructor(options: RedisCacheOptions = {}) {
        this.options = {
            host: options.host ?? "localhost",
            port: options.port ?? 6379,
            password: options.password,
            db: options.db ?? 0,
            prefix: options.prefix ?? "app:cache:",
            enableOfflineQueue: options.enableOfflineQueue !== false,
            useScan: options.useScan !== false,
            maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
        };
        this.connect();
    }

    async connect(): Promise<void> {
        try {
            if (this.client) await this.disconnect();

            const clientOptions = {
                socket: {
                    host: this.options.host,
                    port: this.options.port,
                    reconnectStrategy: (retries: number) => {
                        if (retries > this.options.maxReconnectAttempts) {
                            logger.error({
                                msg: "Max Redis reconnect attempts reached",
                                attempt: retries,
                                maxReconnectAttempts: this.options.maxReconnectAttempts,
                            });
                            return new Error("Max Redis reconnect attempts reached");
                        }
                        const delay = Math.min(
                            Math.pow(2, retries) * 100 + Math.random() * 100,
                            30000
                        );
                        logger.warn({
                            msg: "Redis reconnecting...",
                            attempt: retries,
                            delayMs: Math.round(delay),
                        });
                        return delay;
                    },
                },
                password: this.options.password || undefined,
                database: this.options.db,
            };

            this.client = createClient(clientOptions) as RedisClientType;

            this.client.on("ready", () => {
                this.isConnected = true;
                logger.info({
                    msg: "[Cache] Redis connection established",
                    host: this.options.host,
                    port: this.options.port,
                    db: this.options.db,
                });
            });

            this.client.on("error", (err: Error) => {
                this.isConnected = false;
                logger.error({
                    msg: "[Cache] Redis error",
                    error: err.message,
                    host: this.options.host,
                    port: this.options.port,
                });
            });

            this.client.on("end", () => {
                this.isConnected = false;
                logger.info({ msg: "[Cache] Redis connection closed" });
            });

            await this.client.connect();
            this.isConnected = true;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error({
                msg: "[Cache] Failed to connect to Redis",
                error: message,
                host: this.options.host,
                port: this.options.port,
            });
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client && this.isConnected) {
            try {
                await this.client.quit();
                this.isConnected = false;
                logger.info({ msg: "[Cache] Disconnected from Redis" });
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                logger.error({ msg: "[Cache] Error disconnecting from Redis", error: message });
            }
        }
    }

    async get(key: string): Promise<string | null> {
        try {
            if (!this.isConnected || !this.client) {
                logger.warn({ msg: "[Cache] Redis not connected for get" });
                return null;
            }
            const prefixedKey = this.options.prefix + key;
            const value = await this.client.get(prefixedKey);
            return value;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error({ msg: `[Cache] Redis get error: ${key}`, error: message });
            return null;
        }
    }

    async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
        try {
            if (!this.isConnected || !this.client) {
                logger.warn({ msg: "[Cache] Redis not connected for set" });
                return false;
            }
            const prefixedKey = this.options.prefix + key;
            const str = typeof value === "string" ? value : JSON.stringify(value);
            if (ttl && ttl > 0) {
                await this.client.setEx(prefixedKey, ttl, str);
            } else {
                await this.client.set(prefixedKey, str);
            }
            return true;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error({ msg: `[Cache] Redis set error: ${key}`, error: message });
            return false;
        }
    }

    async del(key: string): Promise<boolean> {
        try {
            if (!this.isConnected || !this.client) return false;
            const prefixedKey = this.options.prefix + key;
            const result = await this.client.del(prefixedKey);
            return result > 0;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error({ msg: `[Cache] Redis del error: ${key}`, error: message });
            return false;
        }
    }

    async delete(key: string): Promise<boolean> {
        return this.del(key);
    }

    private async scanForKeys(pattern: string): Promise<string[]> {
        if (!this.client) return [];
        const keys: string[] = [];
        let cursor: number | string = 0;
        const fullPattern = this.options.prefix + pattern;
        do {
            const result = await this.client.scan(String(cursor), { MATCH: fullPattern, COUNT: 1000 });
            cursor = typeof result.cursor === "string" ? parseInt(result.cursor, 10) : result.cursor;
            if (result.keys?.length) {
                for (const k of result.keys) {
                    if (k.startsWith(this.options.prefix)) {
                        keys.push(k.slice(this.options.prefix.length));
                    } else {
                        keys.push(k);
                    }
                }
            }
        } while (cursor !== 0);
        return keys;
    }

    async delPattern(pattern: string): Promise<boolean> {
        try {
            if (!this.isConnected || !this.client) return false;
            if (!this.options.useScan) return false;
            const keys = await this.scanForKeys(pattern);
            if (keys.length === 0) return false;
            const prefixedKeys = keys.map((k) => this.options.prefix + k);
            await this.client.del(prefixedKeys);
            return true;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error({ msg: `[Cache] Redis delPattern error: ${pattern}`, error: message });
            return false;
        }
    }

    async flush(): Promise<boolean> {
        try {
            if (!this.isConnected || !this.client) return false;
            if (this.options.prefix) {
                const keys = await this.scanForKeys("*");
                if (keys.length > 0) {
                    const prefixedKeys = keys.map((k) => this.options.prefix + k);
                    await this.client.del(prefixedKeys);
                }
                return true;
            }
            await this.client.flushDb();
            return true;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error({ msg: "[Cache] Redis flush error", error: message });
            return false;
        }
    }
}

export default RedisCacheProvider;
