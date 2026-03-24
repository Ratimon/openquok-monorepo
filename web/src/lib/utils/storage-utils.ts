/**
 * Storage utilities
 *
 * Provides utilities for working with browser storage
 */

/**
 * Storage type options
 */
export enum StorageType {
	/**
	 * Local storage (persists across browser sessions)
	 */
	LOCAL = 'local',

	/**
	 * Session storage (persists only for the current browser session)
	 */
	SESSION = 'session',

	/**
	 * Memory storage (persists only for the current page session)
	 */
	MEMORY = 'memory'
}

/**
 * In-memory storage implementation
 */
class MemoryStorage {
	private static data: Record<string, string> = {};

	public static setItem(key: string, value: string): void {
		this.data[key] = value;
	}

	public static getItem(key: string): string | null {
		return key in this.data ? this.data[key] : null;
	}

	public static removeItem(key: string): void {
		delete this.data[key];
	}

	public static clear(): void {
		this.data = {};
	}

	public static keys(): string[] {
		return Object.keys(this.data);
	}
}

function getStorage(type: StorageType): Storage {
	if (typeof window === 'undefined') {
		return MemoryStorage as unknown as Storage;
	}
	switch (type) {
		case StorageType.LOCAL:
			return localStorage;
		case StorageType.SESSION:
			return sessionStorage;
		case StorageType.MEMORY:
			return MemoryStorage as unknown as Storage;
		default:
			throw new Error(`Invalid storage type: ${type}`);
	}
}

/**
 * Store a value in storage
 */
export function storeValue(
	key: string,
	value: unknown,
	type: StorageType = StorageType.LOCAL
): void {
	try {
		const storage = getStorage(type);
		const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
		storage.setItem(key, stringValue);
	} catch (error) {
		console.log(`Failed to store value for key '${key}':`, error);
	}
}

/**
 * Get a value from storage
 */
export function getValue<T = unknown>(
	key: string,
	type: StorageType = StorageType.LOCAL
): T | null {
	try {
		const storage = getStorage(type);
		const value = storage.getItem(key);

		if (value === null) {
			return null;
		}

		try {
			return JSON.parse(value) as T;
		} catch {
			return value as unknown as T;
		}
	} catch (error) {
		console.log(`Failed to get value for key '${key}':`, error);
		return null;
	}
}

/**
 * Remove a value from storage
 */
export function removeValue(key: string, type: StorageType = StorageType.LOCAL): void {
	try {
		const storage = getStorage(type);
		storage.removeItem(key);
	} catch (error) {
		console.log(`Failed to remove value for key '${key}':`, error);
	}
}
