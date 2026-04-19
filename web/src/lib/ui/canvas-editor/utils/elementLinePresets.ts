/** Horizontal line decorations placed on the canvas as SVG (Konva loads them like stock images). */
export type ElementLinePreset = {
	id: string;
	label: string;
	svg: string;
};

/** Panel tile preview: same geometry as {@link ElementLinePreset.svg}, colors follow `currentColor`. */
export function elementLinePresetPanelSvg(canvasSvg: string): string {
	return canvasSvg.replace(/#64748b/g, 'currentColor');
}

export const ELEMENT_LINE_PRESETS: ElementLinePreset[] = [
	{
		id: 'solid',
		label: 'Solid',
		svg: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="48" viewBox="0 0 320 48"><path stroke="#64748b" stroke-width="6" stroke-linecap="round" d="M 12 24 L 308 24"/></svg>`
	},
	{
		id: 'dashed',
		label: 'Dashed',
		svg: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="48" viewBox="0 0 320 48"><path stroke="#64748b" stroke-width="6" stroke-dasharray="14 8" stroke-linecap="round" d="M 12 24 L 308 24"/></svg>`
	},
	{
		id: 'dotted',
		label: 'Dotted',
		svg: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="48" viewBox="0 0 320 48"><path stroke="#64748b" stroke-width="6" stroke-dasharray="4 8" stroke-linecap="round" d="M 12 24 L 308 24"/></svg>`
	},
	{
		id: 'arrow-end',
		label: 'Arrow',
		svg: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="48" viewBox="0 0 320 48"><path stroke="#64748b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M 246 14 L 258 24 L 246 34"/><path stroke="#64748b" stroke-width="6" stroke-linecap="round" d="M 12 24 L 252 24"/></svg>`
	},
	{
		id: 'circle-arrow',
		label: 'Circle and arrow',
		svg: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="48" viewBox="0 0 320 48"><circle cx="22" cy="24" r="8" fill="#64748b"/><path stroke="#64748b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="#64748b" d="M 246 14 L 258 24 L 246 34 Z"/><path stroke="#64748b" stroke-width="6" stroke-linecap="round" d="M 36 24 L 246 24"/></svg>`
	},
	{
		id: 'square-dash-bar',
		label: 'Square and dash',
		svg: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="48" viewBox="0 0 320 48"><path stroke="#64748b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="#64748b" d="M 8 14 L 22 14 L 22 34 L 8 34 Z"/><path stroke="#64748b" stroke-width="6" stroke-dasharray="10 6" stroke-linecap="round" d="M 28 24 L 268 24"/><path stroke="#64748b" stroke-width="6" stroke-linecap="round" d="M 300 14 L 300 34"/></svg>`
	}
];
