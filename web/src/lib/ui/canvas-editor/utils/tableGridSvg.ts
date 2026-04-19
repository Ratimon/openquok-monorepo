export function tableGridSvgString(
	rows: number,
	cols: number,
	cellPx: number,
	stroke = '#0f172a',
	strokeWidthPx = 1.25
): string {
	const pad = 2;
	const w = pad * 2 + cols * cellPx;
	const h = pad * 2 + rows * cellPx;
	const sw = strokeWidthPx;
	let body = '';
	for (let r = 0; r <= rows; r++) {
		const y = pad + r * cellPx;
		body += `<line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" stroke="${stroke}" stroke-width="${sw}"/>`;
	}
	for (let c = 0; c <= cols; c++) {
		const x = pad + c * cellPx;
		body += `<line x1="${x}" y1="${pad}" x2="${x}" y2="${h - pad}" stroke="${stroke}" stroke-width="${sw}"/>`;
	}
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`;
}
