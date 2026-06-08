import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';

type CompanyFields = { [key: string]: string } | null | undefined;

function pickField(
	companyInformation: CompanyFields,
	key: string
): string | undefined {
	const value = companyInformation?.[key];
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

/** Legal business name (LEGAL_NAME, then NAME) for verification copy and footer. */
export function getCompanyName(companyInformation: CompanyFields): string {
	return (
		pickField(companyInformation, 'LEGAL_NAME') ??
		pickField(companyInformation, 'NAME') ??
		(CONFIG_SCHEMA_COMPANY.LEGAL_NAME.default as string)
	);
}

export function getCompanyUrl(companyInformation: CompanyFields): string {
	return (
		pickField(companyInformation, 'URL') ?? (CONFIG_SCHEMA_COMPANY.URL.default as string)
	);
}

/** Nested `companyInformationPm` from public information API. */
export function getCompanyNameFromPm(
	pm: { config?: Record<string, unknown> } | null | undefined
): string {
	const config = pm?.config as { [key: string]: string } | undefined;
	return getCompanyName(config ?? null);
}

export function getCompanyUrlFromPm(
	pm: { config?: Record<string, unknown> } | null | undefined
): string {
	const config = pm?.config as { [key: string]: string } | undefined;
	return getCompanyUrl(config ?? null);
}
