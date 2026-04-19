/** Encode an SVG document as a raster-loadable data URL (used for Konva.Image `src`). */
export function svgToDataUrl(svgString: string): string {
	return 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
}
