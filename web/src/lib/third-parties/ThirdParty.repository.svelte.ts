import type { HttpGateway } from '$lib/core/HttpGateway';

export interface ThirdPartyConfig {
	endpoints: {
		listForMedia: string;
	};
}

/** Registered workspace connector that can surface in media UI (composer or import). */
export interface ThirdPartyConnectorProgrammerModel {
	id: string;
	identifier: string;
	name: string;
	title: string;
	description: string;
	position: string;
}

export interface ThirdPartyListResponseDto {
	success: boolean;
	data?: ThirdPartyConnectorProgrammerModel[];
}

export class ThirdPartyRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: ThirdPartyConfig
	) {}

	public async listForOrganization(organizationId: string): Promise<ThirdPartyConnectorProgrammerModel[]> {
		try {
			const { data: listDto, ok } = await this.httpGateway.get<ThirdPartyListResponseDto>(
				this.config.endpoints.listForMedia,
				{ organizationId },
				{ withCredentials: true }
			);

			if (ok && listDto?.success && Array.isArray(listDto.data)) {
				return listDto.data;
			}
			return [];
		} catch {
			return [];
		}
	}
}
