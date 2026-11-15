/** Parse HTML into a fragment without assigning element.innerHTML (AMO / addons-linter). */
export function htmlToFragment(html: string): DocumentFragment {
	const trimmed = html.trim();
	const parser = new DOMParser();
	const doc = parser.parseFromString(trimmed, 'text/html');
	const fragment = document.createDocumentFragment();
	while (doc.body.firstChild) {
		fragment.appendChild(doc.body.firstChild);
	}
	return fragment;
}

/** Replace all children of `element` with parsed HTML. */
export function replaceElementHtml(element: Element, html: string): void {
	element.replaceChildren(htmlToFragment(html));
}

/** First element node from an HTML string (e.g. side panel templates). */
export function firstElementFromHtml(html: string): HTMLElement {
	const fragment = htmlToFragment(html);
	const first = fragment.firstElementChild;
	if (!first) {
		return document.createElement('div');
	}
	return first as HTMLElement;
}