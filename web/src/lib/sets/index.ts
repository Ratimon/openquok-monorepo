import { httpGateway } from '$lib/core/index';

import { GetSetPresenter } from '$lib/sets/GetSet.presenter.svelte';
import { SetsRepository } from '$lib/sets/Sets.repository.svelte';
import { UpsertSetPresenter } from '$lib/sets/UpsertSet.presenter.svelte';

const setsConfig = {
	endpoints: {
		list: '/api/v1/sets',
		upsert: '/api/v1/sets',
		byId: (id: string) => `/api/v1/sets/${encodeURIComponent(id)}`
	}
};

const setsRepository = new SetsRepository(httpGateway, setsConfig);

export const getSetPresenter = new GetSetPresenter(setsRepository);
export const upsertSetPresenter = new UpsertSetPresenter(setsRepository);

export type { SetProgrammerModel, SetSnapshotProgrammerModel } from '$lib/sets/Sets.repository.svelte';
export type {
	SetRowViewModel,
	SetSharedFollowUpReplyViewModel,
	SetSnapshotViewModel
} from '$lib/sets/GetSet.presenter.svelte';
export type {
	SetDeleteResultViewModel,
	SetUpsertProgrammerModel,
	SetUpsertResultViewModel
} from '$lib/sets/UpsertSet.presenter.svelte';
export type { SetGridTableRowViewModel } from '$lib/sets/SetGridTable.presenter.svelte';
export {
	SetGridTablePresenter,
	sortSetGridRows,
} from '$lib/sets/SetGridTable.presenter.svelte';

export { createSetGridTableFilter} from '$lib/sets/SetGridFilterBuilder.presenter.svelte';