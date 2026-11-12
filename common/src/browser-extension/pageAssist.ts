/**
 * Directory launch (auto-launch) providers: one content-script bundle per `provider_slug`,
 * registered in the extension manifest. Cookie-session channels stay in `cookieSessionProviders.ts`.
 */

/** Mirrors `auto_launch_destinations.extension_config` (API / seeds). */
export type AutoLaunchExtensionConfig = {
	version?: number;
	startUrlPatterns?: readonly string[];
	readyUrlHint?: string;
	steps?: LaunchStep[];
	proof?: Record<string, unknown>;
};

/** How the extension fill engine should set a destination form control (default `text`). */
export const LAUNCH_STEP_FIELD_FILL_MODES = [
	'text',
	'select',
	'boolean',
	'rich_html',
	'tags',
	'checkbox_group',
	'file',
	'files',
] as const;
export type LaunchStepFieldFillMode = (typeof LAUNCH_STEP_FIELD_FILL_MODES)[number];

/** How `fillEngine` matches visible headings to `label` (see destination `extension_config`). */
export const LAUNCH_STEP_FIELD_LABEL_MATCH_MODES = ['default', 'section'] as const;
export type LaunchStepFieldLabelMatch = (typeof LAUNCH_STEP_FIELD_LABEL_MATCH_MODES)[number];

/** How tag compare/fill scopes chip reads to a labeled block (see destination `extension_config`). */
export const LAUNCH_STEP_FIELD_TAGS_SCOPE_MODES = ['section'] as const;
export type LaunchStepFieldTagsScope = (typeof LAUNCH_STEP_FIELD_TAGS_SCOPE_MODES)[number];

export type LaunchStepField = {
	key: string;
	label: string;
	/** Extra headings in the DOM that should anchor this field (e.g. title case variants). */
	labelAliases?: readonly string[];
	profilePath: string;
	selectorHint?: string;
	fillMode?: LaunchStepFieldFillMode;
	/**
	 * `section` — wizard field title only (avoids option rows like Open Launch category "Platform"
	 * matching field label "Platforms"). `default` — general fuzzy label pairing.
	 */
	labelMatch?: LaunchStepFieldLabelMatch;
	/** When `section`, tag fields resolve chips within the heading block (`h3` + search), not site chrome. */
	tagsScope?: LaunchStepFieldTagsScope;
	/** When several `input[type=file]` match, pick by index (default 0). */
	fileInputIndex?: number;
	/** Destination form treats the control as mandatory (compare rail + fill hints). */
	required?: boolean;
	/** Cap for tag/array fields on the directory form (display + compare). */
	maxItems?: number;
	/** Alternate profile paths offered in the compare rail expand row (e.g. tags from discovery dims). */
	profileSourcePaths?: readonly string[];
	/** Truncate scalar fills and flag the profile compare cell when longer (e.g. Uneed tagline 80). */
	maxScalarLength?: number;
	/** Restrict tag fill + highlight unknown profile chips (e.g. `uneed` — see `fieldCatalogRegistry`). */
	tagsCatalog?: string;
	/** Map profile discovery values to directory checkbox labels before fill + compare warnings. */
	checkboxCatalog?: string;
	/** Official single-select labels for compare presets + fill coercion. */
	selectCatalog?: string;
};

export type LaunchStep = {
	id: string;
	label: string;
	fields?: LaunchStepField[];
};

/** Profile fields captured at submission intent time (snake_case matches API snapshot). */
export type AutoLaunchProfileSnapshot = {
	name: string;
	tagline: string | null;
	description: string | null;
	website_url: string | null;
	logo_url: string | null;
	profile_data: Record<string, unknown>;
	integration_customer_id: string | null;
};

export type FieldFillStatus = 'found' | 'not_found' | 'not_in_profile' | 'skipped' | 'error';

export type FieldFillResult = {
	key: string;
	label?: string;
	status: FieldFillStatus;
	message?: string;
};

/** Short paid vs free label for extension directory channel chips (matches link-directory `cost_tier`). */
export type DirectoryLaunchTierLabel = 'Free' | 'Paid';

export interface DirectoryLaunchProvider {
	/** Matches `auto_launch_destinations.provider_slug`. */
	identifier: string;
	/** Human label for popup / diagnostics. */
	name: string;
	/** Shown on the extension Directory tab channel avatar (top-right). */
	tierLabel: DirectoryLaunchTierLabel;
	/** Default entry URL when opening the directory from the extension popup. */
	defaultStartUrl: string;
	/** Built script path under `extension/dist/` (manifest `content_scripts[].js`). */
	contentScriptEntry: string;
	/** Manifest `content_scripts[].matches` entries for this provider. */
	hostPatterns: readonly string[];
	/** Manifest `host_permissions` entry (e.g. `*://*.example.com/*`). */
	hostPermission: string;
}

export {
	directoryLaunchProviders,
	getDirectoryLaunchProvider,
	getDirectoryLaunchSiteKeyFromLocation,
	getDirectoryLaunchUniqueHostPatterns,
	isDirectoryLaunchProviderId,
	listDirectoryLaunchProviderSummaries,
	resolveDirectoryLaunchStartUrl,
} from '../auto-launch/destination-configs/directoryLaunchRegistry.js';

/** Payload stored in the extension after dashboard handoff (`AUTO_LAUNCH_HANDOFF`). */
export type AutoLaunchHandoffSession = {
	submissionId: string;
	launchToken: string;
	providerSlug: string;
	startUrl: string;
	productProfileId?: string;
	profileSnapshotHash?: string;
	profileSnapshot: AutoLaunchProfileSnapshot;
	extensionConfig: AutoLaunchExtensionConfig;
};

export type AutoLaunchProgressPayload = {
	providerSlug: string;
	stepId: string;
	stepLabel?: string;
	stepIndex?: number;
	stepCount?: number;
	filledCount: number;
	totalFields: number;
	fieldResults?: FieldFillResult[];
	errors?: string[];
};

export type AutoLaunchCompletePayload = {
	submissionId: string;
	success: boolean;
	listingUrl?: string;
	error?: string;
};
