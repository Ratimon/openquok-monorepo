import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';

export function isChannelSchedulable(
	ch: CreateSocialPostChannelViewModel | null | undefined
): boolean {
	if (!ch) return false;
	if (typeof (ch as { schedulable?: boolean }).schedulable === 'boolean') {
		return (ch as { schedulable: boolean }).schedulable;
	}
	return !ch.disabled && !ch.inBetweenSteps && !ch.refreshNeeded;
}

export function unschedulableReason(
	ch: CreateSocialPostChannelViewModel | null | undefined
): string | null {
	if (!ch) return 'Channel not found.';
	const vmReason = (ch as { unschedulableReason?: string | null }).unschedulableReason;
	if (typeof vmReason === 'string' || vmReason === null) {
		return vmReason ?? null;
	}
	if (ch.disabled) return 'This channel is disabled.';
	if (ch.inBetweenSteps) return 'Finish connecting this channel first.';
	if (ch.refreshNeeded) return 'Reconnect this channel first.';
	return null;
}

/** User-visible prefix for provider validation toasts and inline copy (network + account name). */
export function formatProviderScheduleValidationMessage(
	ch: CreateSocialPostChannelViewModel,
	raw: string
): string {
	const id = (ch.identifier ?? '').toLowerCase();
	const label = (ch.name ?? '').trim() || 'Channel';
	if (id.startsWith('instagram')) {
		return `Instagram (${label}): ${raw}`;
	}
	if (id === 'threads') {
		return `Threads (${label}): ${raw}`;
	}
	return `${label}: ${raw}`;
}
