import { createHash } from "crypto";
import {
    CustomData,
    EventRequest,
    FacebookAdsApi,
    ServerEvent,
    UserData,
} from "facebook-nodejs-business-sdk";
import { config } from "../config/GlobalConfig";
import {
    ConversionTrackEvent,
    conversionTrackEventName,
} from "../data/types/conversionTrackEvent";

const marketingConfig = config.marketing as {
    facebookPixelId?: string;
    facebookPixelAccessToken?: string;
};

const pixelId = marketingConfig.facebookPixelId?.trim() ?? "";
const accessToken = marketingConfig.facebookPixelAccessToken?.trim() ?? "";

if (accessToken && pixelId) {
    FacebookAdsApi.init(accessToken);
}

export type TrackUserContext = {
    id?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
};

export class TrackService {
    private hashValue(value: string): string {
        return createHash("sha256").update(value).digest("hex");
    }

    track(
        uniqueId: string,
        ip: string,
        userAgent: string,
        tt: ConversionTrackEvent,
        additional: Record<string, unknown> = {},
        fbclid?: string,
        user?: TrackUserContext
    ): Promise<unknown> | undefined {
        if (!accessToken || !pixelId) {
            return undefined;
        }

        const currentTimestamp = Math.floor(Date.now() / 1000);
        const userData = new UserData();

        const clientIp = ip || user?.ip || "";
        if (clientIp) {
            userData.setClientIpAddress(clientIp);
        }

        const agent = userAgent || user?.userAgent || "";
        if (agent) {
            userData.setClientUserAgent(agent);
        }

        if (fbclid) {
            userData.setFbc(fbclid);
        }

        if (user?.email) {
            userData.setEmail(this.hashValue(user.email));
        }

        let customData: CustomData | null = null;
        const value = additional?.value;
        if (typeof value === "number" && Number.isFinite(value)) {
            customData = new CustomData();
            customData.setValue(value).setCurrency("USD");
        }

        const serverEvent = new ServerEvent()
            .setEventName(conversionTrackEventName(tt))
            .setEventTime(currentTimestamp)
            .setActionSource("website");

        if (user?.id) {
            serverEvent.setEventId(uniqueId || user.id);
        }

        serverEvent.setUserData(userData);
        if (customData) {
            serverEvent.setCustomData(customData);
        }

        const eventRequest = new EventRequest(accessToken, pixelId).setEvents([serverEvent]);
        return eventRequest.execute();
    }
}
