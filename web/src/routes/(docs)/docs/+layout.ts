import { getNavigation } from '$lib/docs/index';

export const prerender = true;

export function load() {
	const navigation = getNavigation();
	return { navigation };
}
