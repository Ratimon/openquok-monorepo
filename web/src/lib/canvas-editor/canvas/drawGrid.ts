/**
 * Fills a layer with a light grid for the design workspace background.
 * `Konva` is the default export from the `konva` package (passed from the dynamic import).
 */
export function drawBackgroundGrid(
	Konva: any,
	layer: any,
	sw: number,
	sh: number,
	gridStep: number
): void {
	layer.destroyChildren();
	const g = new Konva.Group({ listening: false });
	const stroke = 'rgba(148,163,184,0.45)';
	for (let x = 0; x <= sw; x += gridStep) {
		g.add(
			new Konva.Line({
				points: [x, 0, x, sh],
				stroke,
				strokeWidth: 1,
				listening: false
			})
		);
	}
	for (let y = 0; y <= sh; y += gridStep) {
		g.add(
			new Konva.Line({
				points: [0, y, sw, y],
				stroke,
				strokeWidth: 1,
				listening: false
			})
		);
	}
	layer.add(g);
}
