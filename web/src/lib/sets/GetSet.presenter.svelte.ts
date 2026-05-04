import type {
	SetProgrammerModel,
	SetSharedFollowUpReplyProgrammerModel,
	SetsRepository,
	SetSnapshotProgrammerModel
} from '$lib/sets/Sets.repository.svelte';
import { parseSetContent } from '$lib/sets/Sets.repository.svelte';

/** List row for set picker and settings (PM → VM). */
export type SetRowViewModel = {
	id: string;
	organizationId: string;
	name: string;
	content: string;
	createdAt: string;
	updatedAt: string;
};

/** Parsed persisted composer snapshot for UI / composer handoff. */
export type SetSnapshotViewModel = SetSnapshotProgrammerModel;

/** Follow-up reply row while authoring a reusable set; same shape as repository PM. */
export type SetSharedFollowUpReplyViewModel = SetSharedFollowUpReplyProgrammerModel;

export type SetListLoadResultViewModel =
	| { ok: true; rows: SetRowViewModel[] }
	| { ok: false; error: string };

function toSetRowVm(pm: SetProgrammerModel): SetRowViewModel {
	return {
		id: pm.id,
		organizationId: pm.organizationId,
		name: pm.name,
		content: pm.content,
		createdAt: pm.createdAt,
		updatedAt: pm.updatedAt
	};
}

export class GetSetPresenter {
	constructor(private readonly setsRepository: SetsRepository) {}

	async loadSetsListVm(organizationId: string): Promise<SetListLoadResultViewModel> {
		const resultPm = await this.setsRepository.listForOrganization(organizationId);
		if (!resultPm.ok) return { ok: false, error: resultPm.error };
		return { ok: true, rows: resultPm.items.map(toSetRowVm) };
	}

	/** Stateless: map stored `content` JSON to a snapshot VM, or `null` if invalid. */
	parseSnapshotFromContentStateless(raw: string): SetSnapshotViewModel | null {
		return parseSetContent(raw);
	}
}
