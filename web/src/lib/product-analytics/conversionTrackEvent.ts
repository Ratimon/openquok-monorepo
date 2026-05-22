/** Conversion events sent to Meta CAPI via backend `/company/t` or `/users/t`. */
export enum ConversionTrackEvent {
	ViewContent = 0,
	CompleteRegistration = 1,
	InitiateCheckout = 2,
	StartTrial = 3,
	Purchase = 4
}

export const CONVERSION_TRACK_EVENT_NAMES: Record<ConversionTrackEvent, string> = {
	[ConversionTrackEvent.ViewContent]: 'ViewContent',
	[ConversionTrackEvent.CompleteRegistration]: 'CompleteRegistration',
	[ConversionTrackEvent.InitiateCheckout]: 'InitiateCheckout',
	[ConversionTrackEvent.StartTrial]: 'StartTrial',
	[ConversionTrackEvent.Purchase]: 'Purchase'
};
