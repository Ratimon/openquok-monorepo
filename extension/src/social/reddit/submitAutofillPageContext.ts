import type { RedditHandoffFillPayload } from './handoffProtocol.js';

const BANNER_ID = 'openquok-reddit-handoff-banner';

export type RedditAutofillResult =
	| { ok: true; filled: ('title' | 'body')[] }
	| { ok: false; error: string };

function queryDeep(root: ParentNode, selector: string): Element | null {
	const direct = root.querySelector(selector);
	if (direct) return direct;
	for (const el of Array.from(root.querySelectorAll('*'))) {
		if (el instanceof Element && el.shadowRoot) {
			const found = queryDeep(el.shadowRoot, selector);
			if (found) return found;
		}
	}
	return null;
}

function walkElementsDeep(
	root: ParentNode,
	visit: (el: Element) => HTMLElement | null
): HTMLElement | null {
	for (const el of Array.from(root.querySelectorAll('*'))) {
		if (!(el instanceof Element)) continue;
		const hit = visit(el);
		if (hit) return hit;
		if (el.shadowRoot) {
			const nested = walkElementsDeep(el.shadowRoot, visit);
			if (nested) return nested;
		}
	}
	return null;
}

function normalizeCompareText(value: string): string {
	return value.replace(/\s+/g, ' ').trim();
}

function fieldContainsText(el: HTMLElement, expected: string): boolean {
	const want = normalizeCompareText(expected);
	if (!want) return true;
	if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
		return normalizeCompareText(el.value).includes(want);
	}
	const text = normalizeCompareText(el.textContent ?? '');
	return text.includes(want) || want.includes(text);
}

function setNativeInputValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
	const proto =
		el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
	const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
	descriptor?.set?.call(el, value);
	el.dispatchEvent(new Event('input', { bubbles: true }));
	el.dispatchEvent(new Event('change', { bubbles: true }));
}

function typeTextCharByChar(el: HTMLElement, text: string): boolean {
	const doc = el.ownerDocument;
	el.focus();
	for (const char of text) {
		if (doc.execCommand('insertText', false, char)) continue;
		el.dispatchEvent(
			new InputEvent('beforeinput', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertText',
				data: char,
			})
		);
	}
	return fieldContainsText(el, text);
}

function simulatePaste(el: HTMLElement, text: string): boolean {
	el.focus();
	try {
		const data = new DataTransfer();
		data.setData('text/plain', text);
		const pasted = el.dispatchEvent(
			new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })
		);
		if (pasted && fieldContainsText(el, text)) return true;
	} catch {
		/* synthetic ClipboardEvent may be restricted */
	}
	el.dispatchEvent(
		new InputEvent('beforeinput', {
			bubbles: true,
			cancelable: true,
			inputType: 'insertFromPaste',
			data: text,
		})
	);
	if (fieldContainsText(el, text)) return true;
	return typeTextCharByChar(el, text);
}

function setEditableText(el: HTMLElement, text: string): boolean {
	const doc = el.ownerDocument;
	el.focus();
	if (el.isContentEditable) {
		const selection = doc.getSelection();
		const range = doc.createRange();
		range.selectNodeContents(el);
		selection?.removeAllRanges();
		selection?.addRange(range);
		if (doc.execCommand('insertText', false, text)) {
			el.dispatchEvent(
				new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text })
			);
			if (fieldContainsText(el, text)) return true;
		}
		if (simulatePaste(el, text)) return true;
		el.textContent = text;
		el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
		return fieldContainsText(el, text);
	}
	if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
		setNativeInputValue(el, text);
		if (fieldContainsText(el, text)) return true;
		return typeTextCharByChar(el, text);
	}
	return false;
}

function findTitleField(root: ParentNode): HTMLElement | null {
	const selectors = [
		'textarea#innerTextArea',
		'input[name="title"]',
		'textarea[name="title"]',
		'faceplate-text-input[name="title"] textarea',
		'faceplate-text-input[name="title"] input',
		'shreddit-composer input[name="title"]',
		'[data-testid="post-title-field"] textarea',
		'[data-testid="post-title-field"] input',
		'[data-testid="post-title-field"] faceplate-text-input textarea',
		'[data-testid="post-title-field"] faceplate-text-input input',
		'shreddit-title-input textarea',
		'shreddit-title-input input',
		'faceplate-text-input#title-field textarea',
		'faceplate-text-input#title-field input',
		'textarea[maxlength="300"]',
	];
	for (const selector of selectors) {
		const el = queryDeep(root, selector);
		if (el instanceof HTMLElement) return el;
	}
	return walkElementsDeep(root, (el) => {
		if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return null;
		const label = (el.getAttribute('aria-label') ?? el.getAttribute('placeholder') ?? '').toLowerCase();
		if (label.includes('title')) return el;
		return null;
	});
}

function findBodyField(root: ParentNode): HTMLElement | null {
	const selectors = [
		'shreddit-composer div[slot="rte"][role="textbox"]',
		'shreddit-composer [contenteditable="true"][role="textbox"]',
		'shreddit-composer div[contenteditable="true"]',
		'[data-testid="post-content-field"] div[contenteditable="true"]',
		'[data-testid="post-content-field"] [role="textbox"]',
		'div[data-lexical-editor="true"]',
		'div[contenteditable="true"][data-lexical-text="true"]',
		'div[contenteditable="true"][role="textbox"]',
		'faceplate-textarea textarea',
		'textarea[name="text"]',
		'textarea[name="body"]',
		'[data-testid="post-content-field"] textarea',
	];
	for (const selector of selectors) {
		const el = queryDeep(root, selector);
		if (el instanceof HTMLElement) return el;
	}
	return walkElementsDeep(root, (el) => {
		if (!(el instanceof HTMLElement)) return null;
		if (!el.isContentEditable && el.getAttribute('role') !== 'textbox') return null;
		const label = (el.getAttribute('aria-label') ?? '').toLowerCase();
		if (label.includes('body') || label.includes('optional') || label.includes('text')) {
			return el;
		}
		if (el.closest('[data-testid="post-content-field"]')) return el;
		if (el.closest('shreddit-composer')) return el;
		return null;
	});
}

export function showRedditHandoffBanner(doc: Document): void {
	const existing = doc.getElementById(BANNER_ID);
	if (existing) return;

	const banner = doc.createElement('div');
	banner.id = BANNER_ID;
	banner.setAttribute('role', 'status');
	banner.textContent =
		'OpenQuok filled this draft. Review everything, then click Post on Reddit yourself.';
	Object.assign(banner.style, {
		position: 'fixed',
		bottom: '16px',
		left: '16px',
		right: '16px',
		zIndex: '2147483646',
		padding: '12px 14px',
		borderRadius: '8px',
		background: 'rgba(15, 23, 42, 0.94)',
		color: '#f8fafc',
		fontSize: '13px',
		lineHeight: '1.4',
		fontFamily: 'system-ui, sans-serif',
		boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
		border: '1px solid rgba(148, 163, 184, 0.35)',
		pointerEvents: 'none',
	});
	doc.body.appendChild(banner);
}

function missingFieldsMessage(payload: RedditHandoffFillPayload, filled: ('title' | 'body')[]): string {
	const missing: string[] = [];
	if (payload.title.trim() && !filled.includes('title')) missing.push('title');
	if (payload.body.trim() && !filled.includes('body')) missing.push('body');
	if (missing.length === 0) {
		return 'Could not find Reddit submit fields yet. Wait for the page to load, then try Autofill again.';
	}
	return `Could not fill Reddit ${missing.join(' and ')} field(s). Wait for the composer to finish loading, then try Autofill again.`;
}

function ensureTextPostTypeSelected(root: ParentNode): void {
	const selectors = [
		'[data-testid="post-type-text"]',
		'button[name="text"]',
		'faceplate-tracker[noun="post_type_text"] button',
	];
	for (const selector of selectors) {
		const el = queryDeep(root, selector);
		if (el instanceof HTMLElement) {
			el.click();
			return;
		}
	}
}

export function applyRedditHandoffAutofill(
	doc: Document,
	payload: RedditHandoffFillPayload
): RedditAutofillResult {
	ensureTextPostTypeSelected(doc);
	const filled: ('title' | 'body')[] = [];
	const root = doc;

	const titleText = payload.title.trim();
	const bodyText = payload.body.trim();

	const titleEl = findTitleField(root);
	if (titleEl && titleText && setEditableText(titleEl, titleText)) {
		filled.push('title');
	} else if (titleText && titleEl && fieldContainsText(titleEl, titleText)) {
		filled.push('title');
	}

	const bodyEl = findBodyField(root);
	if (bodyEl && bodyText && setEditableText(bodyEl, bodyText)) {
		filled.push('body');
	}

	const needsTitle = Boolean(titleText);
	const needsBody = Boolean(bodyText);
	const titleOk = !needsTitle || filled.includes('title');
	const bodyOk = !needsBody || filled.includes('body');

	if (!titleOk || !bodyOk) {
		return { ok: false, error: missingFieldsMessage(payload, filled) };
	}

	if (filled.length === 0) {
		return { ok: false, error: missingFieldsMessage(payload, filled) };
	}

	showRedditHandoffBanner(doc);
	return { ok: true, filled };
}

export function waitForRedditSubmitFields(doc: Document, timeoutMs = 25_000): Promise<boolean> {
	return new Promise((resolve) => {
		const deadline = Date.now() + timeoutMs;
		const check = (): boolean => {
			const hasTitle = Boolean(findTitleField(doc));
			const hasBody = Boolean(findBodyField(doc));
			return hasTitle && hasBody;
		};

		if (check()) {
			resolve(true);
			return;
		}

		const observer = new MutationObserver(() => {
			if (check()) {
				observer.disconnect();
				resolve(true);
			} else if (Date.now() >= deadline) {
				observer.disconnect();
				resolve(check() || Boolean(findTitleField(doc) || findBodyField(doc)));
			}
		});

		observer.observe(doc.documentElement, {
			childList: true,
			subtree: true,
			attributes: true,
		});

		const poll = window.setInterval(() => {
			if (check()) {
				window.clearInterval(poll);
				observer.disconnect();
				resolve(true);
			} else if (Date.now() >= deadline) {
				window.clearInterval(poll);
				observer.disconnect();
				resolve(Boolean(findTitleField(doc) || findBodyField(doc)));
			}
		}, 300);
	});
}

export async function runRedditHandoffAutofillInPage(
	payload: RedditHandoffFillPayload
): Promise<RedditAutofillResult> {
	const ready = await waitForRedditSubmitFields(document);
	if (!ready) {
		return {
			ok: false,
			error: 'Reddit submit fields did not appear in time. Refresh and try again.',
		};
	}

	let last: RedditAutofillResult = {
		ok: false,
		error: 'Reddit submit fields did not accept the draft yet.',
	};
	for (let attempt = 0; attempt < 10; attempt++) {
		const result = applyRedditHandoffAutofill(document, payload);
		last = result;
		if (result.ok) return result;
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	return last;
}

declare global {
	interface Window {
		__openquokExecuteRedditAutofill?: typeof runRedditHandoffAutofillInPage;
	}
}

export function registerRedditAutofillMainWorldHook(): void {
	window.__openquokExecuteRedditAutofill = runRedditHandoffAutofillInPage;
}
