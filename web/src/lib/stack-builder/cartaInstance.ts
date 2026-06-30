import { code } from '@cartamd/plugin-code';
import { emoji } from '@cartamd/plugin-emoji';
import { slash } from '@cartamd/plugin-slash';
import { Carta } from 'carta-md';

/** Shared Carta instance for stack-builder markdown editor (generated + hand-edited export). */
export const stackBuilderCarta = new Carta({
	sanitizer: false,
	rendererDebounce: 150,
	extensions: [code(), emoji(), slash()]
});
