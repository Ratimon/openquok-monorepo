/** Max single `setTimeout` delay (signed 32-bit ms) — longer waits use chunked sleeps. */
export const MAX_TIMER_MS = 2147483647;

export async function sleepChunked(totalMs: number, signal?: AbortSignal): Promise<void> {
    let remaining = totalMs;
    while (remaining > 0) {
        signal?.throwIfAborted();
        const step = Math.min(remaining, MAX_TIMER_MS);
        await new Promise<void>((resolve) => {
            setTimeout(resolve, step);
        });
        remaining -= step;
    }
}
