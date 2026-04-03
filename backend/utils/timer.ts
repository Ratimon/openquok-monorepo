/** Delay helper (matches common `timer(ms)` pattern). */
export const timer = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
