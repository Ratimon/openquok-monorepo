import facebookFollowUpComment from '$openquok-core-examples/facebook-follow-up-comment.json?raw';
import facebookLinkPreview from '$openquok-core-examples/facebook-link-preview.json?raw';
import facebookMultiPhoto from '$openquok-core-examples/facebook-multi-photo.json?raw';
import facebookReel from '$openquok-core-examples/facebook-reel.json?raw';
import facebookTextOnly from '$openquok-core-examples/facebook-text-only.json?raw';
import facebookWithImage from '$openquok-core-examples/facebook-with-image.json?raw';
import threadsCrossAccountPlug from '$openquok-core-examples/threads-cross-account-plug.json?raw';
import xCrossAccountRepost from '$openquok-core-examples/x-cross-account-repost.json?raw';

/** Raw JSON from openquok-core skill examples (single source of truth for landing copy). */
export const OPENQUOK_CORE_EXAMPLE_JSON_BY_FILE: Readonly<Record<string, string>> = {
	'facebook-text-only.json': facebookTextOnly.trim(),
	'facebook-link-preview.json': facebookLinkPreview.trim(),
	'facebook-with-image.json': facebookWithImage.trim(),
	'facebook-multi-photo.json': facebookMultiPhoto.trim(),
	'facebook-reel.json': facebookReel.trim(),
	'facebook-follow-up-comment.json': facebookFollowUpComment.trim(),
	'threads-cross-account-plug.json': threadsCrossAccountPlug.trim(),
	'x-cross-account-repost.json': xCrossAccountRepost.trim()
};
