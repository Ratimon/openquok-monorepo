import { isExternalCdnProfilePictureUrl } from "./allowedExternalImageHosts";
import {
    fetchAllowlistedExternalImageWithOptionalBearer,
    type FetchedExternalImage,
} from "./externalImageFetch";

const GRAPH = "https://graph.facebook.com/v20.0";

/** Public Page avatar endpoint the browser can load (Graph 302s to a fresh signed CDN URL). */
export function facebookGraphProfilePictureUrl(objectId: string): string {
    return `${GRAPH}/${encodeURIComponent(objectId.trim())}/picture?type=large`;
}

async function imageFromResponse(response: Response): Promise<FetchedExternalImage | null> {
    if (!response.ok) return null;
    const contentType = (response.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? "";
    if (!contentType.startsWith("image/")) return null;
    return { buffer: Buffer.from(await response.arrayBuffer()), contentType };
}

async function fetchRemotePictureUrl(
    pictureUrl: string | null | undefined,
    accessToken?: string
): Promise<FetchedExternalImage | null> {
    const url = pictureUrl?.trim();
    if (!url || !isExternalCdnProfilePictureUrl(url)) return null;
    try {
        return await fetchAllowlistedExternalImageWithOptionalBearer(url, accessToken);
    } catch {
        return null;
    }
}

async function fetchFacebookGraphPicture(
    objectId: string,
    accessToken: string
): Promise<FetchedExternalImage | null> {
    const id = objectId.trim();
    const token = accessToken.trim();
    if (!id || !token) return null;
    const auth = { Authorization: `Bearer ${token}` };
    const tokenQuery = `access_token=${encodeURIComponent(token)}`;

    try {
        const redirectRes = await fetch(`${facebookGraphProfilePictureUrl(id)}&${tokenQuery}`, {
            method: "GET",
            redirect: "follow",
            headers: auth,
        });
        const fromRedirect = await imageFromResponse(redirectRes);
        if (fromRedirect) return fromRedirect;
    } catch {
        /* try JSON picture URL next */
    }

    try {
        const metaRes = await fetch(
            `${GRAPH}/${encodeURIComponent(id)}?fields=picture.type(large),profile_picture_url&${tokenQuery}`,
            { headers: auth }
        );
        const meta = (await metaRes.json()) as {
            picture?: { data?: { url?: string } };
            profile_picture_url?: string;
        };
        const url = meta.profile_picture_url || meta.picture?.data?.url;
        return await fetchRemotePictureUrl(url, token);
    } catch {
        return null;
    }
}

async function fetchLinkedInPersonPicture(accessToken: string): Promise<FetchedExternalImage | null> {
    try {
        const res = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const json = (await res.json()) as { picture?: string };
        return await fetchRemotePictureUrl(json.picture, accessToken);
    } catch {
        return null;
    }
}

async function fetchLinkedInOrganizationPicture(
    organizationId: string,
    accessToken: string
): Promise<FetchedExternalImage | null> {
    const id = organizationId.trim();
    if (!id) return null;
    try {
        const res = await fetch(
            `https://api.linkedin.com/v2/organizations/${encodeURIComponent(id)}` +
                "?projection=(logoV2(original~:playableStreams))",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "X-Restli-Protocol-Version": "2.0.0",
                    "LinkedIn-Version": "202601",
                },
            }
        );
        const org = (await res.json()) as {
            logoV2?: { "original~"?: { elements?: Array<{ identifiers?: Array<{ identifier?: string }> }> } };
        };
        const url = org.logoV2?.["original~"]?.elements?.[0]?.identifiers?.[0]?.identifier;
        return await fetchRemotePictureUrl(url, accessToken);
    } catch {
        return null;
    }
}

/** Download a channel avatar via the provider API when the stored CDN URL 403s. */
export async function downloadProviderProfilePicture(params: {
    providerIdentifier: string;
    internalId: string;
    accessToken: string;
}): Promise<FetchedExternalImage | null> {
    const token = params.accessToken.trim();
    const internalId = params.internalId.trim();
    if (!token || !internalId) return null;

    switch (params.providerIdentifier) {
        case "facebook":
        case "instagram-business":
            return fetchFacebookGraphPicture(internalId, token);
        case "linkedin":
            return fetchLinkedInPersonPicture(token);
        case "linkedin-page":
            return fetchLinkedInOrganizationPicture(internalId, token);
        default:
            return null;
    }
}
