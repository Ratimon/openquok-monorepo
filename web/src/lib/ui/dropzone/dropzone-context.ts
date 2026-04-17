import type { ClassValue } from "clsx";
import { createContext } from "svelte";

import * as themes from "./theme";

export type ThemeConfig = {
	[K in keyof typeof themes]?: (typeof themes)[K]["slots"] extends undefined
		? ClassValue
		: Partial<{ [L in keyof (typeof themes)[K]["slots"]]: ClassValue }>;
};

function createSafeContext<T>() {
	const [getRaw, set] = createContext<T>();

	function get(): T | undefined {
		try {
			return getRaw();
		} catch {
			return undefined;
		}
	}

	return [get, set] as const;
}

const [getThemeContext, setThemeContext] = createSafeContext<ThemeConfig>();
export { getThemeContext, setThemeContext };

export function getTheme<K extends keyof ThemeConfig>(componentKey: K) {
	const theme = getThemeContext();
	return theme?.[componentKey];
}
