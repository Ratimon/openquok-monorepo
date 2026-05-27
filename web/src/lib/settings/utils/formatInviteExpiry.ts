/** Human-readable relative expiry for workspace invite rows. */
export function formatInviteExpiry(expiresAt: string): string {
	try {
		const d = new Date(expiresAt);
		if (Number.isNaN(d.getTime())) return 'Expired';
		const now = new Date();
		if (d <= now) return 'Expired';
		const diffMs = d.getTime() - now.getTime();
		const diffM = Math.floor(diffMs / 60000);
		if (diffM < 60) return `Expires in ${diffM} min`;
		const diffH = Math.floor(diffM / 60);
		if (diffH < 48) return `Expires in ${diffH} hour${diffH !== 1 ? 's' : ''}`;
		const diffD = Math.floor(diffH / 24);
		return `Expires in ${diffD} day${diffD !== 1 ? 's' : ''}`;
	} catch {
		return '';
	}
}
