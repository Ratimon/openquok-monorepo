import type { Appearance } from '@stripe/stripe-js';

export function isDarkCheckoutTheme(): boolean {
	if (typeof document === 'undefined') return true;
	const theme = document.documentElement.getAttribute('data-theme') ?? 'forest';
	return theme !== 'light';
}

export function embeddedCheckoutAppearance(isDark: boolean): Appearance {
	return {
		variables: {
			colorText: isDark ? '#ffffff' : '#0e0e0e',
			borderRadius: '8px',
			colorBackground: isDark ? '#1E1E1E' : '#FFFFFF'
		},
		rules: {
			'.Label': {
				fontSize: '14px',
				fontWeight: '600',
				marginBottom: '8px'
			},
			'.Input': {
				padding: '12px',
				backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF'
			}
		}
	};
}
