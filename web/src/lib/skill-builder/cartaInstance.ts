import { code } from '@cartamd/plugin-code';
import { emoji } from '@cartamd/plugin-emoji';
import { slash } from '@cartamd/plugin-slash';
import { Carta } from 'carta-md';

import { preprocessMarkdownForPreview } from '$lib/skill-builder/utils/preprocessMarkdownForPreview';

/** Shared Carta instance for skill-builder markdown editor (generated + hand-edited export). */
export const skillBuilderCarta = new Carta({
	sanitizer: false,
	rendererDebounce: 150,
	extensions: [code(), emoji(), slash()]
});

const renderPreview = (markdown: string) => preprocessMarkdownForPreview(markdown);

const originalRender = skillBuilderCarta.render.bind(skillBuilderCarta);
skillBuilderCarta.render = async (markdown: string) => originalRender(renderPreview(markdown));

const originalRenderSSR = skillBuilderCarta.renderSSR.bind(skillBuilderCarta);
skillBuilderCarta.renderSSR = (markdown: string) => originalRenderSSR(renderPreview(markdown));
