import { redirect } from '@sveltejs/kit';

/** Safari / iOS probe `/apple-touch-icon.png` at site root regardless of `<link rel="apple-touch-icon">`. */
export function GET() {
	return redirect(302, '/pwa/apple-touch-icon.png');
}
