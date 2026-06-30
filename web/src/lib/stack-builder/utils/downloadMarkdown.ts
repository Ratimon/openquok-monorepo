/** Trigger a browser download for generated stack markdown. */
export function downloadMarkdownFile(markdown: string, filename = 'agent-stack.md'): void {
	if (typeof document === 'undefined') return;

	const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.rel = 'noopener';
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}
