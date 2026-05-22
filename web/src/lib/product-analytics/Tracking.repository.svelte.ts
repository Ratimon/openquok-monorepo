import type { HttpGateway } from '$lib/core/HttpGateway';
import { HttpMethod } from '$lib/core/HttpGateway';
import type { ConversionTrackEvent } from '$lib/product-analytics/conversionTrackEvent';

export interface TrackingConfig {
	endpoints: {
		publicTrack: string;
		userTrack: string;
	};
}

export type TrackConversionResponseDto = {
	success?: boolean;
	data?: { track?: string };
};

export class TrackingRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: TrackingConfig
	) {}

	async trackConversion(params: {
		event: ConversionTrackEvent;
		additional?: Record<string, unknown>;
		fbclid?: string;
		authenticated: boolean;
	}): Promise<string | undefined> {
		const url = params.authenticated
			? this.config.endpoints.userTrack
			: this.config.endpoints.publicTrack;
		const { data: trackDto, ok } = await this.httpGateway.request<TrackConversionResponseDto>({
			method: HttpMethod.POST,
			url,
			data: {
				tt: params.event,
				...(params.additional ? { additional: params.additional } : {}),
				...(params.fbclid ? { fbclid: params.fbclid } : {})
			},
			withCredentials: true
		});
		if (ok && trackDto?.data?.track) {
			return trackDto.data.track;
		}
		return undefined;
	}
}
