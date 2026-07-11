import type { Thing, WithContext } from 'schema-dts';

/** Canonical Schema.org JSON-LD `@context` value. */
export const SCHEMA_ORG_CONTEXT = 'https://schema.org' as const;

/** A single node inside a JSON-LD `@graph` array. */
export type JsonLdGraphNode = Thing;

/** JSON-LD document with `@context` and a `@graph` of schema nodes. */
export type JsonLdGraphSchema = {
	'@context': typeof SCHEMA_ORG_CONTEXT;
	'@graph': JsonLdGraphNode[];
};

/** JSON-LD document with `@context` and a single top-level schema node. */
export type JsonLdSchema<T extends Thing = Thing> = WithContext<T>;

/** Build a typed `@graph` JSON-LD document. */
export function createJsonLdGraph(nodes: readonly JsonLdGraphNode[]): JsonLdGraphSchema {
	return {
		'@context': SCHEMA_ORG_CONTEXT,
		'@graph': [...nodes]
	};
}

/** Build a typed single-node JSON-LD document (no `@graph`). */
export function createJsonLdWithContext<T extends Thing>(node: T): WithContext<T> {
	return Object.assign({ '@context': SCHEMA_ORG_CONTEXT }, node) as WithContext<T>;
}

/** Drop optional schema helpers that return `{}` when there is nothing to emit. */
export function filterNonEmptyJsonLdNodes(
	nodes: readonly (JsonLdGraphNode | Record<string, never>)[]
): JsonLdGraphNode[] {
	return nodes.filter((node) => Object.keys(node).length > 0) as JsonLdGraphNode[];
}
