/** Standard conversion events forwarded to Meta Conversions API. */
export enum ConversionTrackEvent {
    ViewContent = 0,
    CompleteRegistration = 1,
    InitiateCheckout = 2,
    StartTrial = 3,
    Purchase = 4,
}

export function conversionTrackEventName(tt: ConversionTrackEvent): string {
    return ConversionTrackEvent[tt] ?? "ViewContent";
}
