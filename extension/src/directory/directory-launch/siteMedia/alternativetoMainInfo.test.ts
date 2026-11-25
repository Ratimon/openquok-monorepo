import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	nearestTextareaBefore,
	resolveAlternativetoFullDescriptionControl,
	resolveAlternativetoShortDescriptionControl,
} from './alternativetoMainInfo.js';

describe('AlternativeTo manage-item main info fields', () => {
	beforeEach(() => {
		document.body.innerHTML = `
			<section id="main-info">
				<h2>Main info</h2>
				<label for="short">Short Description</label>
				<textarea id="short" name="shortDescription"></textarea>
				<p id="short-help">
					What is the main purpose of this app / software? Keep it short, preferably in one concise sentence.
				</p>
				<label for="full">Full Description</label>
				<textarea id="full" name="description"></textarea>
				<p id="full-help">
					A longer description of the application; this could be written by yourself or taken from official material.
				</p>
			</section>
		`;
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('resolves distinct short and full description controls via helper copy', () => {
		expect(resolveAlternativetoShortDescriptionControl()?.id).toBe('short');
		expect(resolveAlternativetoFullDescriptionControl()?.id).toBe('full');
		expect(nearestTextareaBefore(document.getElementById('short-help')!)?.id).toBe('short');
		expect(nearestTextareaBefore(document.getElementById('full-help')!)?.id).toBe('full');
	});
});