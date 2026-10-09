import { registerBrowserExtensionRefreshToken } from '$lib/integrations/browser-extension/extensionRefreshRegistration';
import { toast } from '$lib/ui/sonner';

/** Store the extension refresh JWT after a successful chrome-extension connect (non-blocking UX). */
export async function afterExtensionChannelConnect(params: {
	providerId: string;
	integrationId: string;
	extensionToken?: string;
}): Promise<void> {
	if (!params.extensionToken?.trim()) return;
	const registered = await registerBrowserExtensionRefreshToken({
		providerId: params.providerId,
		integrationId: params.integrationId,
		refreshToken: params.extensionToken
	});
	if (!registered.ok) {
		toast.error(registered.error, {
			description: 'The channel is connected, but automatic session refresh may not run until you reconnect.'
		});
	}
}
