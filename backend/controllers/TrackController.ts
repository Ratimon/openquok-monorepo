import type { Request, Response, NextFunction } from "express";
import type { TrackService } from "../services/TrackService";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { TrackEventBody } from "../data/schemas/trackSchemas";
import { makeId } from "../utils/ids/makeId";
import { sessionCookieAttributes } from "../utils/session/sessionCookies";

const TRACK_COOKIE = "track";
const FBCLID_COOKIE = "fbclid";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

function readClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.trim()) {
        return forwarded.split(",")[0]?.trim() ?? "";
    }
    return req.socket.remoteAddress ?? "";
}

function readUserAgent(req: Request): string {
    const raw = req.headers["user-agent"];
    return typeof raw === "string" ? raw : "";
}

function ensureTrackCookies(
    req: Request,
    res: Response,
    uniqueId: string,
    fbclid?: string
): void {
    if (!req.cookies?.[TRACK_COOKIE]) {
        res.cookie(TRACK_COOKIE, uniqueId, sessionCookieAttributes(ONE_YEAR_MS));
    }
    if (fbclid && !req.cookies?.[FBCLID_COOKIE]) {
        res.cookie(FBCLID_COOKIE, fbclid, sessionCookieAttributes(ONE_YEAR_MS));
    }
}

export class TrackController {
    constructor(private readonly trackService: TrackService) {}

    trackPublic = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const body = req.body as TrackEventBody;
        const uniqueId = (req.cookies?.[TRACK_COOKIE] as string | undefined) || makeId(10);
        const fbclid = (req.cookies?.[FBCLID_COOKIE] as string | undefined) || body.fbclid;

        await this.trackService.track(
            uniqueId,
            readClientIp(req),
            readUserAgent(req),
            body.tt,
            body.additional ?? {},
            fbclid
        );

        ensureTrackCookies(req, res, uniqueId, body.fbclid);
        res.status(200).json({ success: true, data: { track: uniqueId } });
    };

    trackAuthenticated = async (
        req: AuthenticatedRequest,
        res: Response,
        _next: NextFunction
    ): Promise<void> => {
        const body = req.body as TrackEventBody;
        const uniqueId = (req.cookies?.[TRACK_COOKIE] as string | undefined) || makeId(10);
        const fbclid = (req.cookies?.[FBCLID_COOKIE] as string | undefined) || body.fbclid;
        const authUser = req.user;

        await this.trackService.track(
            uniqueId,
            readClientIp(req),
            readUserAgent(req),
            body.tt,
            body.additional ?? {},
            fbclid,
            authUser
                ? {
                      id: authUser.publicId ?? authUser.id,
                      email: authUser.email,
                  }
                : undefined
        );

        ensureTrackCookies(req, res, uniqueId, body.fbclid);
        res.status(200).json({ success: true, data: { track: uniqueId } });
    };
}
