/** Merge listing `schemaJson` nodes into a JSON-LD `@graph` array. */
export function mergeListingSchemaIntoGraph(
	baseGraph: Record<string, unknown>[],
	schemaJson: Record<string, unknown> | null | undefined
): Record<string, unknown>[] {
	if (!schemaJson || Object.keys(schemaJson).length === 0) {
		return baseGraph;
	}

	const graph = schemaJson['@graph'];
	if (Array.isArray(graph)) {
		return [...baseGraph, ...graph.filter((node) => node && typeof node === 'object')];
	}

	if (typeof schemaJson['@type'] === 'string') {
		return [...baseGraph, schemaJson];
	}

	return baseGraph;
}
