import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

/** Agent workflow capability — pick this first, then provider, then model. */
export type LlmUseCaseSlug =
	| 'chat'
	| 'code'
	| 'reasoning'
	| 'image_generation'
	| 'image_editing'
	| 'video_generation'
	| 'audio_generation'
	| 'speech_to_text'
	| 'embeddings'
	| 'web_search';

export type LlmProviderSlug =
	| 'openai'
	| 'anthropic'
	| 'google'
	| 'xai'
	| 'meta'
	| 'mistral'
	| 'deepseek'
	| 'local';

export type LlmUseCaseCatalogEntry = {
	slug: LlmUseCaseSlug;
	label: string;
	description: string;
};

export type LlmProviderCatalogEntry = {
	slug: LlmProviderSlug;
	label: string;
	/** Product-facing name shown in the form (e.g. ChatGPT). */
	displayLabel: string;
	description: string;
	iconName: IconName;
};

export type LlmModelCatalogEntry = {
	slug: string;
	label: string;
	/** Provider API model id when routing calls. */
	apiModelId: string;
	provider: LlmProviderSlug;
	useCases: LlmUseCaseSlug[];
	description?: string;
};

export const LLM_USE_CASES: LlmUseCaseCatalogEntry[] = [
	{
		slug: 'chat',
		label: 'Chat & agents',
		description: 'General conversation, tool use, and multi-turn agent workflows.'
	},
	{
		slug: 'code',
		label: 'Code & engineering',
		description: 'Codegen, refactors, reviews, and repository-aware agent tasks.'
	},
	{
		slug: 'reasoning',
		label: 'Deep reasoning',
		description: 'Long-horizon planning, analysis, and careful instruction following.'
	},
	{
		slug: 'image_generation',
		label: 'Image generation',
		description: 'Text-to-image for marketing assets, app previews, and creative output.'
	},
	{
		slug: 'image_editing',
		label: 'Image editing',
		description: 'Edit, inpaint, or restyle existing images — e.g. App Store screenshot variants.'
	},
	{
		slug: 'video_generation',
		label: 'Video generation',
		description: 'Text- or image-to-video clips for product demos and social content.'
	},
	{
		slug: 'audio_generation',
		label: 'Audio & voice',
		description: 'Text-to-speech and voice output for agents and media pipelines.'
	},
	{
		slug: 'speech_to_text',
		label: 'Speech to text',
		description: 'Transcription and spoken-input understanding.'
	},
	{
		slug: 'embeddings',
		label: 'Embeddings',
		description: 'Vector embeddings for search, RAG, and semantic retrieval.'
	},
	{
		slug: 'web_search',
		label: 'Web search',
		description: 'Real-time search and current-events grounding.'
	}
];

export const LLM_PROVIDERS: LlmProviderCatalogEntry[] = [
	{
		slug: 'openai',
		label: 'OpenAI',
		displayLabel: 'ChatGPT',
		description: 'GPT, GPT Image, and Sora models across chat, image, video, and audio.',
		iconName: icons.ChatGPT.name
	},
	{
		slug: 'anthropic',
		label: 'Anthropic',
		displayLabel: 'Claude',
		description: 'Claude models for chat, code, and vision — no native image/video generation.',
		iconName: icons.Claude.name
	},
	{
		slug: 'google',
		label: 'Google',
		displayLabel: 'Gemini',
		description: 'Gemini, Imagen, and Veo for multimodal chat, image, and video.',
		iconName: icons.Gemini.name
	},
	{
		slug: 'xai',
		label: 'xAI',
		displayLabel: 'Grok',
		description: 'Grok models with strong real-time X data and emerging image capabilities.',
		iconName: icons.X.name
	},
	{
		slug: 'meta',
		label: 'Meta',
		displayLabel: 'Llama',
		description: 'Open Llama weights for chat and code on hosted or self-hosted infra.',
		iconName: icons.Bot.name
	},
	{
		slug: 'mistral',
		label: 'Mistral AI',
		displayLabel: 'Mistral',
		description: 'Mistral and Mixtral models for efficient chat and code workloads.',
		iconName: icons.Bot.name
	},
	{
		slug: 'deepseek',
		label: 'DeepSeek',
		displayLabel: 'DeepSeek',
		description: 'Cost-efficient open-weight models for chat and software engineering.',
		iconName: icons.Bot.name
	},
	{
		slug: 'local',
		label: 'Self-hosted',
		displayLabel: 'Ollama & local',
		description: 'Run open weights on your own hardware with full data control.',
		iconName: icons.Bot.name
	}
];

export const LLM_MODELS: LlmModelCatalogEntry[] = [
	// OpenAI — chat / code / reasoning
	{
		slug: 'gpt-5.5',
		label: 'GPT-5.5',
		apiModelId: 'gpt-5.5',
		provider: 'openai',
		useCases: ['chat', 'code', 'reasoning', 'web_search'],
		description: 'Versatile flagship for agents, browser automation, and multimodal chat.'
	},
	{
		slug: 'gpt-4o',
		label: 'GPT-4o',
		apiModelId: 'gpt-4o',
		provider: 'openai',
		useCases: ['chat', 'code', 'reasoning'],
		description: 'Fast, capable default for tool use and structured output.'
	},
	{
		slug: 'gpt-4o-mini',
		label: 'GPT-4o mini',
		apiModelId: 'gpt-4o-mini',
		provider: 'openai',
		useCases: ['chat', 'code'],
		description: 'Lower-latency option for high-volume agent workloads.'
	},
	// OpenAI — image
	{
		slug: 'gpt-image-2',
		label: 'GPT Image 2',
		apiModelId: 'gpt-image-2',
		provider: 'openai',
		useCases: ['image_generation', 'image_editing'],
		description: 'State-of-the-art image generation and editing.'
	},
	{
		slug: 'gpt-image-1.5',
		label: 'GPT Image 1.5',
		apiModelId: 'gpt-image-1.5',
		provider: 'openai',
		useCases: ['image_generation', 'image_editing'],
		description: 'Strong image model for marketing previews and screenshot-style assets.'
	},
	{
		slug: 'gpt-image-1',
		label: 'GPT Image 1',
		apiModelId: 'gpt-image-1',
		provider: 'openai',
		useCases: ['image_generation', 'image_editing'],
		description: 'Earlier GPT Image generation and edit pipeline.'
	},
	// OpenAI — video
	{
		slug: 'sora-2',
		label: 'Sora 2',
		apiModelId: 'sora-2',
		provider: 'openai',
		useCases: ['video_generation'],
		description: 'Fast iteration for concept video and motion drafts.'
	},
	{
		slug: 'sora-2-pro',
		label: 'Sora 2 Pro',
		apiModelId: 'sora-2-pro',
		provider: 'openai',
		useCases: ['video_generation'],
		description: 'Higher-fidelity video for production and marketing assets.'
	},
	// OpenAI — audio / embeddings
	{
		slug: 'gpt-4o-audio',
		label: 'GPT-4o Audio',
		apiModelId: 'gpt-4o-audio-preview',
		provider: 'openai',
		useCases: ['audio_generation', 'speech_to_text'],
		description: 'Native audio input and voice output in the chat stack.'
	},
	{
		slug: 'text-embedding-3-large',
		label: 'text-embedding-3-large',
		apiModelId: 'text-embedding-3-large',
		provider: 'openai',
		useCases: ['embeddings'],
		description: 'High-quality embeddings for RAG and semantic search.'
	},
	// Anthropic
	{
		slug: 'claude-opus-4.8',
		label: 'Claude Opus 4.8',
		apiModelId: 'claude-opus-4-8',
		provider: 'anthropic',
		useCases: ['chat', 'code', 'reasoning'],
		description: 'Top-tier coding and long-horizon agentic workflows.'
	},
	{
		slug: 'claude-sonnet-4.6',
		label: 'Claude Sonnet 4.6',
		apiModelId: 'claude-sonnet-4-6',
		provider: 'anthropic',
		useCases: ['chat', 'code', 'reasoning'],
		description: 'Balanced speed and quality for everyday agent tasks.'
	},
	{
		slug: 'claude-haiku-4.5',
		label: 'Claude Haiku 4.5',
		apiModelId: 'claude-haiku-4-5',
		provider: 'anthropic',
		useCases: ['chat', 'code'],
		description: 'Fast, cost-efficient Claude for high-volume chat.'
	},
	// Google
	{
		slug: 'gemini-3.1-pro',
		label: 'Gemini 3.1 Pro',
		apiModelId: 'gemini-3.1-pro',
		provider: 'google',
		useCases: ['chat', 'code', 'reasoning', 'web_search'],
		description: 'Flagship multimodal model with very large context.'
	},
	{
		slug: 'gemini-3.5-flash',
		label: 'Gemini 3.5 Flash',
		apiModelId: 'gemini-3.5-flash',
		provider: 'google',
		useCases: ['chat', 'code'],
		description: 'Fast Gemini tier for agents and bulk workloads.'
	},
	{
		slug: 'gemini-2.5-flash-image',
		label: 'Gemini 2.5 Flash Image',
		apiModelId: 'gemini-2.5-flash-image',
		provider: 'google',
		useCases: ['image_generation', 'image_editing'],
		description: 'Native Gemini image generation and editing.'
	},
	{
		slug: 'imagen-3',
		label: 'Imagen 3',
		apiModelId: 'imagen-3.0-generate-002',
		provider: 'google',
		useCases: ['image_generation'],
		description: 'Dedicated Google image generation model.'
	},
	{
		slug: 'veo-3',
		label: 'Veo 3',
		apiModelId: 'veo-3.0-generate-001',
		provider: 'google',
		useCases: ['video_generation'],
		description: 'Google video generation for cinematic clips.'
	},
	{
		slug: 'gemini-2.5-flash-live',
		label: 'Gemini 2.5 Flash Live',
		apiModelId: 'gemini-2.5-flash-live-preview',
		provider: 'google',
		useCases: ['audio_generation', 'speech_to_text'],
		description: 'Real-time audio dialogue and transcription.'
	},
	{
		slug: 'text-embedding-004',
		label: 'text-embedding-004',
		apiModelId: 'text-embedding-004',
		provider: 'google',
		useCases: ['embeddings'],
		description: 'Google embeddings for search and retrieval.'
	},
	// xAI Grok
	{
		slug: 'grok-4.3',
		label: 'Grok 4.3',
		apiModelId: 'grok-4.3',
		provider: 'xai',
		useCases: ['chat', 'reasoning', 'web_search'],
		description: 'Latest Grok with document output and video understanding.'
	},
	{
		slug: 'grok-4.20',
		label: 'Grok 4.20',
		apiModelId: 'grok-4.20',
		provider: 'xai',
		useCases: ['chat', 'code', 'web_search'],
		description: 'Strong tool-use Grok for agent workflows.'
	},
	{
		slug: 'grok-imagine',
		label: 'Grok Imagine',
		apiModelId: 'grok-imagine',
		provider: 'xai',
		useCases: ['image_generation', 'image_editing'],
		description: 'Grok image generation pipeline.'
	},
	// Meta Llama
	{
		slug: 'llama-4-maverick',
		label: 'Llama 4 Maverick',
		apiModelId: 'llama-4-maverick',
		provider: 'meta',
		useCases: ['chat', 'code'],
		description: 'Meta open-weight chat and code on hosted endpoints.'
	},
	// Mistral
	{
		slug: 'mistral-large-3',
		label: 'Mistral Large 3',
		apiModelId: 'mistral-large-latest',
		provider: 'mistral',
		useCases: ['chat', 'code', 'reasoning'],
		description: 'Flagship Mistral for European-hosted workloads.'
	},
	{
		slug: 'mistral-small-3',
		label: 'Mistral Small 3',
		apiModelId: 'mistral-small-latest',
		provider: 'mistral',
		useCases: ['chat', 'code'],
		description: 'Efficient Mistral tier for volume chat.'
	},
	// DeepSeek
	{
		slug: 'deepseek-v4',
		label: 'DeepSeek V4',
		apiModelId: 'deepseek-v4',
		provider: 'deepseek',
		useCases: ['chat', 'code', 'reasoning'],
		description: 'Open-weight frontier model for engineering tasks.'
	},
	// Local / Ollama
	{
		slug: 'llama-3.3-70b',
		label: 'Llama 3.3 70B',
		apiModelId: 'llama3.3:70b',
		provider: 'local',
		useCases: ['chat', 'code'],
		description: 'Popular Ollama default for private chat agents.'
	},
	{
		slug: 'qwen-2.5-coder',
		label: 'Qwen 2.5 Coder',
		apiModelId: 'qwen2.5-coder:32b',
		provider: 'local',
		useCases: ['code'],
		description: 'Local coding model via Ollama or vLLM.'
	}
];
