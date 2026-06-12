declare module "facebook-nodejs-business-sdk" {
    export class FacebookAdsApi {
        static init(accessToken: string): void;
    }

    export class UserData {
        setClientIpAddress(ip: string): UserData;
        setClientUserAgent(agent: string): UserData;
        setFbc(fbc: string): UserData;
        setEmail(email: string): UserData;
    }

    export class CustomData {
        setValue(value: number): CustomData;
        setCurrency(currency: string): CustomData;
    }

    export class ServerEvent {
        setEventName(name: string): ServerEvent;
        setEventTime(time: number): ServerEvent;
        setActionSource(source: string): ServerEvent;
        setEventId(id: string): ServerEvent;
        setUserData(data: UserData): ServerEvent;
        setCustomData(data: CustomData): ServerEvent;
    }

    export class EventRequest {
        constructor(accessToken: string, pixelId: string);
        setEvents(events: ServerEvent[]): EventRequest;
        execute(): Promise<unknown>;
    }
}
