<script lang="ts">
	import {
		OPENQUOK_CORE_SKILL_INSTALL_CUE_CLI,
		OPENQUOK_CORE_SKILL_INSTALL_CUE_FOLDER,
		OPENQUOK_CORE_SKILL_INSTALL_CUE_PUBLISH
	} from '$lib/content/constants/agents/cli-command-reference';

	const blocks = `## Install openquok-core on the Cue computer

${OPENQUOK_CORE_SKILL_INSTALL_CUE_FOLDER}

## Optional — publish to the skill catalog
${OPENQUOK_CORE_SKILL_INSTALL_CUE_PUBLISH}

## OpenQuok CLI
${OPENQUOK_CORE_SKILL_INSTALL_CUE_CLI}`;
</script>

<pre class="whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-emerald-400">{blocks}</pre>