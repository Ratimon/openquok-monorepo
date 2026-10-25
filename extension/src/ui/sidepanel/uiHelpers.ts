export function el(html: string): HTMLElement {
	const template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.firstElementChild as HTMLElement;
}

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function runtimeSendMessage(message: Record<string, unknown>): Promise<unknown> {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(message, (response) => {
			const lastError = chrome.runtime.lastError;
			if (lastError?.message) {
				reject(new Error(lastError.message));
				return;
			}
			resolve(response);
		});
	});
}
