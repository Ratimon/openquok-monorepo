import type { Organization, SoftwareSourceCode } from 'schema-dts';

export type SoftwareSourceCodeBlockInput = {
	index: number;
	language: string;
	text: string;
	name: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
	bash: 'Shell',
	sh: 'Shell',
	shell: 'Shell',
	shellscript: 'Shell',
	typescript: 'TypeScript',
	ts: 'TypeScript',
	javascript: 'JavaScript',
	js: 'JavaScript',
	json: 'JSON',
	python: 'Python',
	py: 'Python',
	yaml: 'YAML',
	yml: 'YAML',
	html: 'HTML',
	svelte: 'Svelte',
	php: 'PHP',
	go: 'Go',
	ruby: 'Ruby',
	java: 'Java',
	plaintext: 'Plain text'
};

function normalizeLanguage(language: string): string {
	return language.trim().toLowerCase();
}

export function softwareSourceCodeProgrammingLanguageLabel(language: string): string | undefined {
	const key = normalizeLanguage(language);
	if (!key || key === 'plaintext') return undefined;
	return LANGUAGE_LABELS[key] ?? language.trim();
}

export function softwareSourceCodeEncodingFormat(language: string): string | undefined {
	switch (normalizeLanguage(language)) {
		case 'typescript':
		case 'ts':
			return 'text/typescript';
		case 'javascript':
		case 'js':
			return 'text/javascript';
		case 'json':
			return 'application/json';
		case 'bash':
		case 'sh':
		case 'shell':
		case 'shellscript':
			return 'text/x-shellscript';
		case 'python':
		case 'py':
			return 'text/x-python';
		case 'yaml':
		case 'yml':
			return 'text/yaml';
		case 'html':
			return 'text/html';
		case 'svelte':
			return 'text/svelte';
		case 'php':
			return 'application/x-httpd-php';
		case 'go':
			return 'text/x-go';
		case 'ruby':
			return 'text/x-ruby';
		case 'java':
			return 'text/x-java';
		default:
			return undefined;
	}
}

export function softwareSourceCodeBlockId(canonicalUrl: string, index: number): string {
	return `${canonicalUrl}#doc-code-${index + 1}`;
}

function jsonLdNodeRef(id: string): { '@id': string } {
	return { '@id': id };
}

/** Build Schema.org `SoftwareSourceCode` nodes for docs (and other) code snippets. */
export function createSoftwareSourceCodeNodes(params: {
	blocks: SoftwareSourceCodeBlockInput[];
	canonicalUrl: string;
	parentId: string;
	author: Organization;
}): SoftwareSourceCode[] {
	const { blocks, canonicalUrl, parentId, author } = params;

	return blocks.map((block) => {
		const programmingLanguage = softwareSourceCodeProgrammingLanguageLabel(block.language);
		const encodingFormat = softwareSourceCodeEncodingFormat(block.language);
		const blockId = softwareSourceCodeBlockId(canonicalUrl, block.index);

		return {
			'@type': 'SoftwareSourceCode',
			'@id': blockId,
			name: block.name,
			url: blockId,
			text: block.text,
			codeSampleType: 'code snippet',
			...(programmingLanguage ? { programmingLanguage } : {}),
			...(encodingFormat ? { encodingFormat } : {}),
			author,
			isPartOf: jsonLdNodeRef(parentId)
		} satisfies SoftwareSourceCode;
	});
}
