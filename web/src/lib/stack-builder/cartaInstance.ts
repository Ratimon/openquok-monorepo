import { code } from '@cartamd/plugin-code';
import { emoji } from '@cartamd/plugin-emoji';
import { slash } from '@cartamd/plugin-slash';
import { Carta } from 'carta-md';

import { preprocessMarkdownForPreview } from '$lib/stack-builder/utils/preprocessMarkdownForPreview';

/** Shared Carta instance for stack-builder markdown editor (generated + hand-edited export). */
export const stackBuilderCarta = new Carta({
	sanitizer: false,
	rendererDebounce: 150,
	extensions: [code(), emoji(), slash()]
});

const renderPreview = (markdown: string) => preprocessMarkdownForPreview(markdown);

const originalRender = stackBuilderCarta.render.bind(stackBuilderCarta);
stackBuilderCarta.render = async (markdown: string) => originalRender(renderPreview(markdown));

const originalRenderSSR = stackBuilderCarta.renderSSR.bind(stackBuilderCarta);
stackBuilderCarta.renderSSR = (markdown: string) => originalRenderSSR(renderPreview(markdown));
