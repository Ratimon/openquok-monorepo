import { env } from '$env/dynamic/private';

const DEFAULT_CLI_AUTH_SERVER = 'https://cli-auth.openquok.com';

/** Origin of the CLI device-flow auth server (API: /device/code, /device/token). */
export function getCliAuthServerUrl(): string {
	const raw = env.CLI_AUTH_SERVER_URL?.trim() || DEFAULT_CLI_AUTH_SERVER;
	return raw.replace(/\/+$/, '');
}
