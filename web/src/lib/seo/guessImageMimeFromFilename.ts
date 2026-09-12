/** Guess MIME type from a storage filename or URL path (OG / JSON-LD image). */
export function guessImageMimeFromFilename(filename: string): string {
	const name = filename.split('?')[0].toLowerCase();
	const ext = name.split('.').pop();
	switch (ext) {
		case 'png':
			return 'image/png';
		case 'webp':
			return 'image/webp';
		case 'gif':
			return 'image/gif';
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'svg':
			return 'image/svg+xml';
		case 'avif':
			return 'image/avif';
		default:
			return 'image/jpeg';
	}
}
