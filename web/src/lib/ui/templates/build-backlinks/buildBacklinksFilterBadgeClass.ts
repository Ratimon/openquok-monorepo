import { cn } from '$lib/ui/helpers/common';

export function buildBacklinksFilterBadgeClass(active: boolean): string {
	return cn(
		'badge badge-sm cursor-pointer transition-colors',
		active ? 'badge-primary' : 'badge-outline hover:bg-primary/10'
	);
}
