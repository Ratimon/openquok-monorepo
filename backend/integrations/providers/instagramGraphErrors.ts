/**
 * Maps common Instagram Graph API error payloads to user-facing messages.
 * Mirrors the high-traffic cases handled in production social schedulers.
 */
export function humanizeInstagramGraphError(raw: string): string {
    const body = raw || "";
    if (body.indexOf("2207081") > -1) {
        return "This account doesn't support Trial Reels";
    }
    if (body.indexOf("param collaborators is not allowed") > -1) {
        return "Collaborators are not allowed for carousel posts";
    }
    if (body.toLowerCase().indexOf("the user is not an instagram business") > -1) {
        return "Your Instagram account is not a business account; convert it to a professional account";
    }
    if (body.indexOf("2207042") > -1) {
        return "You have reached the maximum of 25 posts per day for this account";
    }
    if (body.indexOf("2207028") > -1) {
        return "Carousel validation failed";
    }
    if (body.indexOf("2207026") > -1) {
        return "Unsupported video format";
    }
    if (body.indexOf("2207009") > -1 || body.indexOf("36003") > -1) {
        return "Aspect ratio not supported; must be between 4:5 and 1.91:1";
    }
    if (body.indexOf("2207003") > -1) {
        return "Timeout downloading media; please try again";
    }
    if (body.indexOf("2207020") > -1) {
        return "Media expired; please upload again";
    }
    if (body.indexOf("2207004") > -1) {
        return "Image is too large";
    }
    if (body.indexOf("Not enough permissions to post") > -1) {
        return "Not enough permissions to post";
    }
    if (body.indexOf("Page request limit reached") > -1) {
        return "Page posting for today is limited; please try again tomorrow";
    }
    return body;
}
