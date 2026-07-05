export type {
	SkillBuilderPageViewModel,
	SkillBuilderLibraryItemKind,
	SkillBuilderLibraryItemViewModel,
	SkillBuilderWorkflowStepViewModel,
	ToolsIndexToolCardViewModel
} from '$lib/skill-builder/skillBuilder.types';

export {
	DEFAULT_SKILL_BUILDER_EXTENSION_SLUGS,
	OPENQUOK_CORE_EXTENSION_SLUG,
	OPENQUOK_CLI_GETTING_STARTED_URL,
	OPENQUOK_CORE_SKILL_SETUP_URL,
	OPENQUOK_CLI_NPM_URL,
	CREATING_SKILLS_DOC_URL,
	SKILL_DEFAULT_NAME,
	SKILL_DEFAULT_TITLE,
	SKILL_DEFAULT_VERSION,
	SKILL_DEFAULT_LICENSE,
	SKILL_STARTER_CORE_WORKFLOW,
	SKILL_STARTER_COMMAND_NAMES,
	createDefaultStarterWorkflowSteps
} from '$lib/skill-builder/constants/defaults';

export {
	OPENQUOK_COMMAND_WORKFLOW_META,
	buildCommandWorkflowStepFromLibraryItem,
	resolveCommandWorkflowTitle
} from '$lib/skill-builder/constants/openquokCommandWorkflowMeta';

export {
	OPENQUOK_COMMAND_TEMPLATES,
	OPENQUOK_CORE_QUICK_REFERENCE,
	resolveOpenquokCommandTemplate
} from '$lib/skill-builder/constants/openquokCliCommandSnippets';

export { REVENUECAT_MCP_EXTENSION_SLUG, buildSkillPrerequisitesMarkdown } from '$lib/skill-builder/utils/buildSkillPrerequisites';

export { buildLibraryItems } from '$lib/skill-builder/utils/buildLibraryItems';
export {
	buildQuickReferenceMarkdown,
	collectMcpServerNames,
	resolveMcpServerName
} from '$lib/skill-builder/utils/buildQuickReferenceMarkdown';
export type { QuickReferenceExtension } from '$lib/skill-builder/utils/buildQuickReferenceMarkdown';
export { generateSkillMarkdown } from '$lib/skill-builder/utils/generateSkillMarkdown';
export { downloadMarkdownFile } from '$lib/skill-builder/utils/downloadMarkdown';
export {
	parseExtensionSlugsFromQuery,
	serializeExtensionSlugs,
	ensureOpenquokCoreExtensionSlug,
	SKILL_BUILDER_BUILDING_BLOCKS_QUERY_PARAM,
	SKILL_BUILDER_LEGACY_EXTENSIONS_QUERY_PARAM,
	getBuildingBlockSlugsQueryParam
} from '$lib/skill-builder/utils/parseBuilderQuery';

export { blueprintToWorkflowSteps } from '$lib/skill-builder/utils/blueprintToBuilderState';
