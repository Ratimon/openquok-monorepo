import type { NextFunction, Request, Response } from "express";
import { CLOUD_TRIAL_BROWSER_COOKIE_NAME } from "../constants/cloudTrialBrowserSignal";
import {
    normalizeCloudTrialBrowserSignal,
    type RequestWithCloudTrialBrowserSignal,
} from "../utils/billing/resolveCloudTrialBrowserSignal";

/** Parse `oq_cloud_trial_browser` from cookies after `cookie-parser`. */
export function trialBrowserSignalMiddleware(req: Request, _res: Response, next: NextFunction): void {
    const raw = req.cookies?.[CLOUD_TRIAL_BROWSER_COOKIE_NAME];
    const normalized = normalizeCloudTrialBrowserSignal(typeof raw === "string" ? raw : null);
    if (normalized) {
        (req as RequestWithCloudTrialBrowserSignal).cloudTrialBrowserSignalId = normalized;
    }
    next();
}
