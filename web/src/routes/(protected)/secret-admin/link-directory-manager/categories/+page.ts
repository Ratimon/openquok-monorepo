import { createSecretAdminClientPageLoad } from '$lib/area-admin/utils/createSecretAdminClientPageLoad';

export const ssr = false;

export const load = createSecretAdminClientPageLoad('Secret admin: Link directory categories');
