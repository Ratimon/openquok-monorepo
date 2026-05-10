/** Context for opening the OpenAPI docs playground modal from nested components (e.g. Try it bar). */
export const DOCS_PLAYGROUND = Symbol('docsPlayground');

export type DocsPlaygroundContext = {
	open: () => void;
};
