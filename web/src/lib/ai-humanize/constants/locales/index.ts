import { HUMANIZE_UI_COPY as EN_UI_COPY } from '$lib/ai-humanize/constants/locales/en/ui';
import { HUMANIZE_UI_COPY as TH_UI_COPY } from '$lib/ai-humanize/constants/locales/th/ui';

export type { HumanizeLocale } from '$lib/ai-humanize/constants/locales/types';

export * from '$lib/ai-humanize/constants/locales/en/index';
export * from '$lib/ai-humanize/constants/locales/th/index';

export const HUMANIZE_UI_COPY = { en: EN_UI_COPY, th: TH_UI_COPY } as const;
