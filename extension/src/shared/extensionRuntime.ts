/** Content-script helpers when the extension is reloaded while a tab stays open. */

export function isExtensionContextInvalidatedError(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	return message.includes('Extension context invalidated');
}

/** False after the user reloads the extension in chrome://extensions (until the tab is refreshed). */
export function isExtensionRuntimeAvailable(): boolean {
	try {
		return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
	} catch {
		return false;
	}
}

export async function sendRuntimeMessage<T = unknown>(
	message: Record<string, unknown>
): Promise<T | undefined> {
	if (!isExtensionRuntimeAvailable()) {
		return undefined;
	}
	try {
		return (await chrome.runtime.sendMessage(message)) as T;
	} catch (error) {
		if (isExtensionContextInvalidatedError(error)) {
			return undefined;
		}
		throw error;
	}
}
