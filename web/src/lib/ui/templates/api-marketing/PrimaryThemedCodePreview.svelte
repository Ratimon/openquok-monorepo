<script module lang="ts">
	function escapeHtml(text: string): string {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function highlightJsonValue(valuePart: string): string {
		const trimmedEnd = valuePart.trimEnd();
		const trailing = valuePart.slice(trimmedEnd.length);
		const leading = valuePart.slice(0, valuePart.length - trimmedEnd.length);
		const trimmed = trimmedEnd.trimStart();
		const valueLeading = trimmedEnd.slice(0, trimmedEnd.length - trimmed.length);

		const stringMatch = trimmed.match(/^("(?:[^"\\]|\\.)*")(,)?$/);
		if (stringMatch) {
			const [, value, comma] = stringMatch;
			return `${escapeHtml(leading + valueLeading)}<span class="text-primary/85">${escapeHtml(value)}</span>${comma ? `<span class="text-base-content/40">${escapeHtml(comma)}</span>` : ''}${escapeHtml(trailing)}`;
		}

		const literalMatch = trimmed.match(/^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)(,)?$/);
		if (literalMatch) {
			const [, value, comma] = literalMatch;
			return `${escapeHtml(leading + valueLeading)}<span class="text-base-content/70">${escapeHtml(value)}</span>${comma ? `<span class="text-base-content/40">${escapeHtml(comma)}</span>` : ''}${escapeHtml(trailing)}`;
		}

		return escapeHtml(valuePart);
	}

	function highlightJsonLine(line: string): string {
		const indentMatch = line.match(/^(\s*)/);
		const indent = indentMatch?.[1] ?? '';
		const rest = line.slice(indent.length);

		const keyMatch = rest.match(/^("(?:[^"\\]|\\.)*")(\s*:\s*)(.*)$/);
		if (keyMatch) {
			const [, key, colon, valuePart] = keyMatch;
			return `${escapeHtml(indent)}<span class="text-primary font-semibold">${escapeHtml(key)}</span><span class="text-base-content/40">${escapeHtml(colon)}</span>${highlightJsonValue(valuePart)}`;
		}

		return `${escapeHtml(indent)}<span class="text-base-content/40">${escapeHtml(rest)}</span>`;
	}

	export function buildPrimaryThemedJsonHtml(json: string): string {
		const trimmed = json.trim();
		if (!trimmed) {
			return '<code class="font-mono text-primary/70"></code>';
		}

		let formatted = trimmed;
		try {
			formatted = JSON.stringify(JSON.parse(trimmed), null, 2);
		} catch {
			return `<code class="font-mono whitespace-pre-wrap text-primary">${escapeHtml(trimmed)}</code>`;
		}

		const body = formatted.split('\n').map(highlightJsonLine).join('\n');
		return `<code class="font-mono whitespace-pre-wrap">${body}</code>`;
	}

	const SHELL_TOKEN_REGEX =
		/('(?:[^'\\]|\\.)*')|(-[A-Za-z]+)|(@[\w.@-]+)|(\bcurl\b)|(\\)|(\s+)|(\S+)/g;

	function highlightShellLine(line: string): string {
		const tokens: string[] = [];

		for (const match of line.matchAll(SHELL_TOKEN_REGEX)) {
			const token = match[0];
			if (!token) continue;

			if (match[1]) {
				tokens.push(`<span class="text-primary/85">${escapeHtml(token)}</span>`);
			} else if (match[2]) {
				tokens.push(`<span class="text-primary/75 font-semibold">${escapeHtml(token)}</span>`);
			} else if (match[3]) {
				tokens.push(`<span class="text-primary/85">${escapeHtml(token)}</span>`);
			} else if (match[4]) {
				tokens.push(`<span class="text-primary font-semibold">${escapeHtml(token)}</span>`);
			} else if (match[5]) {
				tokens.push(`<span class="text-base-content/40">${escapeHtml(token)}</span>`);
			} else {
				tokens.push(`<span class="text-base-content/80">${escapeHtml(token)}</span>`);
			}
		}

		return tokens.join('');
	}

	export function buildPrimaryThemedShellHtml(shell: string): string {
		const trimmed = shell.trim();
		if (!trimmed) {
			return '<code class="font-mono text-primary/70"></code>';
		}

		const body = trimmed.split('\n').map(highlightShellLine).join('\n');
		return `<code class="font-mono whitespace-pre-wrap">${body}</code>`;
	}
</script>

<script lang="ts">
	type Props = {
		code: string;
		kind: 'json' | 'shell';
	};

	let { code, kind }: Props = $props();

	const html = $derived(
		kind === 'shell' ? buildPrimaryThemedShellHtml(code) : buildPrimaryThemedJsonHtml(code)
	);
</script>

<!-- eslint-disable svelte/no-at-html-tags -->
{@html html}
