import { redirect } from '@sveltejs/kit';

/** Legacy iOS path; same asset as `/pwa/apple-touch-icon.png`. */
export function GET() {
	return redirect(302, '/pwa/apple-touch-icon.png');
}
