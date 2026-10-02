import type { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';
import type { LinkDirectorySubmissionDto } from '$lib/link-directory/link-directory-admin.types';

export class AdminLinkDirectorySubmissionsManagerPagePresenter {
	public submissionsVm: LinkDirectorySubmissionDto[] = $state([]);
	public loading = $state(false);

	constructor(private readonly linkDirectoryRepository: LinkDirectoryRepository) {}

	public async loadSubmissions(fetch?: typeof globalThis.fetch): Promise<LinkDirectorySubmissionDto[]> {
		this.loading = true;
		try {
			const rows = await this.linkDirectoryRepository.getAdminSubmissions(fetch);
			this.submissionsVm = [...rows].sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
			return this.submissionsVm;
		} finally {
			this.loading = false;
		}
	}

	public updateSubmissionStatus(submissionId: string, status: string): void {
		this.submissionsVm = this.submissionsVm.map((row) =>
			row.id === submissionId ? { ...row, status } : row
		);
	}
}
