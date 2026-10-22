/** Case-insensitive hostname match for competitor rows vs overview/history DTOs. */
export function normalizeDirectorySeoDomainKey(domain: string): string {
	return domain.trim().toLowerCase();
}
