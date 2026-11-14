export type ExtensionBuildTarget = 'chromium' | 'firefox';

declare const __OPENQUOK_BUILD_TARGET__: ExtensionBuildTarget | undefined;

export const EXTENSION_BUILD_TARGET: ExtensionBuildTarget =
	typeof __OPENQUOK_BUILD_TARGET__ !== 'undefined' ? __OPENQUOK_BUILD_TARGET__ : 'chromium';

export function isFirefoxExtensionBuild(): boolean {
	return EXTENSION_BUILD_TARGET === 'firefox';
}

export function isChromiumExtensionBuild(): boolean {
	return EXTENSION_BUILD_TARGET === 'chromium';
}
