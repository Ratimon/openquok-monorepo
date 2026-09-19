/**
 * Jev "what to post" checks + OpenQuok Global vs per-channel drafts.
 *
 * Decision rules inspired by classic social guidance: relevant, engaging,
 * actionable, visuals, and channel-specific copy (see oauth2-for-apps/jev-decision-routing.md).
 *
 * Prerequisites:
 *   npm install @typesafe-ai/sdk @openquok/node-sdk
 *
 *   export TYPESAFE_API_KEY="sk-..."
 *   export OPENQUOK_API_KEY="opo_..."
 *   export OPENQUOK_THREADS_INTEGRATION_ID="<uuid>"
 *   export OPENQUOK_LINKEDIN_INTEGRATION_ID="<uuid>"   # optional, for per-channel demo
 *
 * Run:
 *   node jev-route-draft.mjs "Launch update: excited to share our Q3 results with customers."
 */
import { fileURLToPath } from "node:url";

import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";
import Openquok from "@openquok/node-sdk";

/** @typedef {import("@openquok/node-sdk").PublicCreatePostDto} PublicCreatePostDto */

/**
 * @param {{
 *   globalCaption: string;
 *   threadsId: string;
 *   linkedInId?: string;
 * }} proposal
 * @param {string} composeMode
 * @returns {PublicCreatePostDto | null}
 */
function buildPostPayload(proposal, composeMode) {
	const { globalCaption, threadsId, linkedInId } = proposal;
	const ids = linkedInId ? [threadsId, linkedInId] : [threadsId];
	const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

	if (composeMode === "not_ready") return null;

	if (composeMode === "global_same_copy") {
		return {
			scheduledAt,
			status: "draft",
			body: globalCaption,
			integrationIds: ids,
			isGlobal: true,
			note: "Jev: global copy — review before scheduling",
			isAgent: true,
		};
	}

	if (composeMode === "per_channel_copy" && linkedInId) {
		return {
			scheduledAt,
			status: "draft",
			body: globalCaption,
			integrationIds: ids,
			isGlobal: false,
			bodiesByIntegrationId: {
				[threadsId]: globalCaption,
				[linkedInId]: `${globalCaption}\n\nRead more on our site.`,
			},
			note: "Jev: per-channel copy — review before scheduling",
			isAgent: true,
		};
	}

	if (composeMode === "global_copy_per_channel_settings") {
		return {
			scheduledAt,
			status: "draft",
			body: globalCaption,
			integrationIds: ids,
			isGlobal: true,
			providerSettingsByIntegrationId: linkedInId
				? { [linkedInId]: { linkedin: { postAsImagesCarousel: false } } }
				: undefined,
			note: "Jev: global copy, per-channel settings only",
			isAgent: true,
		};
	}

	// Fallback: single-channel global draft
	return {
		scheduledAt,
		status: "draft",
		body: globalCaption,
		integrationIds: [threadsId],
		isGlobal: true,
		note: "Jev: default global draft",
		isAgent: true,
	};
}

/**
 * @param {{ message: string; threadsId: string; linkedInId?: string; relevanceFloor?: number }} params
 */
export async function evaluateAndCreateDraft(params) {
	const { message, threadsId, linkedInId, relevanceFloor = 0.55 } = params;

	if (!threadsId?.trim()) {
		throw new Error("threadsId is required (set OPENQUOK_THREADS_INTEGRATION_ID)");
	}

	const jev = new TypeSafeClient();
	const decision = await jev.systemOne({
		state: {
			proposal: {
				caption: message,
				targetChannelCount: linkedInId ? 2 : 1,
			},
		},
		questions: {
			relevant: noul(
				"The post is relevant — it informs, entertains, or serves the audience",
			),
			engaging: score("How engaging is this copy for social feeds?", [
				"Flat or generic — little reason to react",
				"Acceptable — clear but not compelling",
				"Strong — likely to earn likes or replies",
			]),
			actionable: noul(
				"A reader would want to share, comment, or take a clear next step",
			),
			needs_media: noul(
				"The post requires or strongly benefits from a photo or video asset",
			),
			compose_mode: choice("How should OpenQuok compose this post?", {
				global_same_copy:
					"One caption and shared media for every selected channel",
				per_channel_copy:
					"Different caption or tone per network (e.g. casual Threads, formal LinkedIn)",
				global_copy_per_channel_settings:
					"Same caption everywhere; only platform settings differ (title, post type, tags)",
				not_ready: "Copy is not ready to schedule — needs human edit",
			}),
		},
	});

	const { relevant, engaging, actionable, needs_media, compose_mode } = decision.answers;

	if (relevant.noul < relevanceFloor) {
		return { action: "human_review", reason: "Not relevant enough to post" };
	}

	if (engaging.score < 0.8 && engaging.confidence > 0.6) {
		return { action: "human_review", reason: "Low engagement — revise copy" };
	}

	if (actionable.noul < 0.35) {
		return { action: "human_review", reason: "Weak actionable signal" };
	}

	const payload = buildPostPayload(
		{ globalCaption: message, threadsId, linkedInId },
		compose_mode.choice,
	);

	if (!payload) {
		return { action: "human_review", reason: "Jev marked post as not ready" };
	}

	if (needs_media.noul > 0.7 && !payload.media?.length) {
		payload.note = `${payload.note ?? ""} — attach media before scheduling`;
	}

	const apiKey = process.env.OPENQUOK_API_KEY;
	if (!apiKey) {
		throw new Error("OPENQUOK_API_KEY is required");
	}

	const openquok = new Openquok(apiKey, {
		baseUrl: process.env.OPENQUOK_API_URL ?? "https://api.openquok.com",
	});

	await openquok.isConnected();
	const created = await openquok.postAsAgent(payload);

	return {
		action: "draft_created",
		composeMode: compose_mode.choice,
		postGroup: created?.data?.postGroup,
		relevant: relevant.noul,
		engaging: engaging.score,
	};
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
	const message =
		process.argv[2] ??
		"Launch update: excited to share our Q3 results — same news on Threads and LinkedIn, but LinkedIn should sound more formal.";
	const threadsId = process.env.OPENQUOK_THREADS_INTEGRATION_ID ?? "";
	const linkedInId = process.env.OPENQUOK_LINKEDIN_INTEGRATION_ID || undefined;

	evaluateAndCreateDraft({ message, threadsId, linkedInId })
		.then((result) => {
			console.log(JSON.stringify(result, null, 2));
		})
		.catch((err) => {
			console.error(err);
			process.exitCode = 1;
		});
}
