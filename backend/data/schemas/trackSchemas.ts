import type { RequestHandler } from "express";
import { z } from "zod";
import { validateRequest } from "../../middlewares/validateRequest";
import { ConversionTrackEvent } from "../types/conversionTrackEvent";

export const trackEventBodySchema = z.object({
    tt: z.nativeEnum(ConversionTrackEvent),
    fbclid: z.string().optional(),
    additional: z.record(z.unknown()).optional().default({}),
});

export type TrackEventBody = z.infer<typeof trackEventBodySchema>;

export const validateTrackEventRequest: RequestHandler = validateRequest({
    body: trackEventBodySchema,
});
