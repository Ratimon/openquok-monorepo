import { httpGateway } from '$lib/core/index';

import { SetsRepository } from '$lib/sets/Sets.repository.svelte';

const setsConfig = {
	endpoints: {
		list: '/api/v1/sets',
		upsert: '/api/v1/sets',
		byId: (id: string) => `/api/v1/sets/${encodeURIComponent(id)}`
	}
};

export const setsRepository = new SetsRepository(httpGateway, setsConfig);

export type { SetProgrammerModel } from '$lib/sets/Sets.repository.svelte';
export type { SetSnapshotV1 } from '$lib/sets/setSnapshot';
export { parseSetContent, stringifySetSnapshot } from '$lib/sets/setSnapshot';
