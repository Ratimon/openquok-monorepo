import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { firstElementFromHtml, htmlToFragment, replaceElementHtml } from './domHtml.js';

describe('domHtml', () => {
	beforeEach(() => {
		document.body.replaceChildren();
	});

	afterEach(() => {
		document.body.replaceChildren();
	});

	it('firstElementFromHtml returns a single root element', () => {
		const el = firstElementFromHtml('<p class="x">Hello</p>');
		expect(el.tagName).toBe('P');
		expect(el.className).toBe('x');
		expect(el.textContent).toBe('Hello');
	});

	it('replaceElementHtml replaces children', () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		replaceElementHtml(host, '<span id="a">1</span><span id="b">2</span>');
		expect(host.querySelector('#a')?.textContent).toBe('1');
		expect(host.querySelector('#b')?.textContent).toBe('2');
	});

	it('htmlToFragment preserves svg markup', () => {
		const frag = htmlToFragment(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>'
		);
		expect(frag.firstChild?.nodeName.toLowerCase()).toBe('svg');
	});
});