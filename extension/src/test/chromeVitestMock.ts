import type { Mock } from 'vitest';
import { vi } from 'vitest';

type CookiesGetAllFn = (
	details: chrome.cookies.GetAllDetails
) => Promise<chrome.cookies.Cookie[]>;

/** Minimal `chrome` surface used in extension unit tests (globals stubbed via `vi.stubGlobal`). */
export type TestChrome = {
	cookies: {
		getAll: Mock<CookiesGetAllFn>;
	};
	storage: {
		local: {
			get: Mock<
				(keys?: string | string[] | Record<string, unknown> | null) => Promise<Record<string, unknown>>
			>;
			set: Mock<(items: Record<string, unknown>) => Promise<void>>;
		};
		session?: {
			get: Mock<
				(keys?: string | string[] | Record<string, unknown> | null) => Promise<Record<string, unknown>>
			>;
			set: Mock<(items: Record<string, unknown>) => Promise<void>>;
		};
	};
};

export function testChrome(): TestChrome {
	return globalThis.chrome as unknown as TestChrome;
}

export function mockCookiesGetAll(): TestChrome['cookies']['getAll'] {
	return testChrome().cookies.getAll;
}

export function stubDefaultTestChrome(): void {
	vi.stubGlobal('chrome', {
		cookies: {
			getAll: vi.fn<CookiesGetAllFn>(),
		},
		storage: {
			local: {
				get: vi.fn().mockResolvedValue({}),
				set: vi.fn().mockResolvedValue(undefined),
			},
		},
	} satisfies TestChrome);
}
