/**
 * Built-in editable templates (PM) for the design column.
 * Types live on {@link CanvasDesignRepository}; this module only holds the static rows.
 */
import type { DesignTemplateProgrammerModel } from '$lib/canvas/CanvasDesign.repository.svelte';

export const DESIGN_TEMPLATES_PM: DesignTemplateProgrammerModel[] = [
	{
		id: 'blank',
		label: 'Blank',
		description: 'Empty page.',
		previewUrl: 'https://dummyimage.com/240x300/ffffff/111827.png&text=Blank',
		doc: { pageFill: '#ffffff', nodes: [] },
		universal: true
	},
	{
		id: 'quote-card',
		label: 'Quote card',
		description: 'A simple quote + author.',
		previewUrl: 'https://dummyimage.com/240x300/fef3c7/111827.png&text=Quote',
		doc: {
			pageFill: '#fef3c7',
			nodes: [
				{
					kind: 'text',
					id: 't-quote',
					x: 48,
					y: 72,
					width: 720,
					rotation: 0,
					opacity: 1,
					draggable: true,
					text: '“Your quote goes here.”',
					fontSize: 56,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#111827',
					fontStyle: 'bold'
				},
				{
					kind: 'text',
					id: 't-author',
					x: 48,
					y: 198,
					width: 720,
					rotation: 0,
					opacity: 0.9,
					draggable: true,
					text: '— Author',
					fontSize: 28,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#111827',
					fontStyle: 'normal'
				}
			]
		},
		universal: true
	},
	{
		id: 'announcement',
		label: 'Announcement',
		description: 'Big headline + details.',
		previewUrl: 'https://dummyimage.com/240x300/e0e7ff/111827.png&text=Announcement',
		doc: {
			pageFill: '#e0e7ff',
			nodes: [
				{
					kind: 'text',
					id: 't-headline',
					x: 48,
					y: 62,
					width: 720,
					rotation: 0,
					opacity: 1,
					draggable: true,
					text: 'Big news',
					fontSize: 72,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#1e293b',
					fontStyle: 'bold'
				},
				{
					kind: 'text',
					id: 't-sub',
					x: 48,
					y: 156,
					width: 720,
					rotation: 0,
					opacity: 0.95,
					draggable: true,
					text: 'Add a short description here.',
					fontSize: 34,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#334155',
					fontStyle: 'normal'
				},
				{
					kind: 'text',
					id: 't-meta',
					x: 48,
					y: 214,
					width: 720,
					rotation: 0,
					opacity: 0.85,
					draggable: true,
					text: 'Date • Location • Link',
					fontSize: 24,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#334155',
					fontStyle: 'normal'
				}
			]
		},
		universal: true
	},
	{
		id: 'vertical-feed',
		label: 'Vertical feed',
		description: 'Story-style title + caption.',
		previewUrl: 'https://dummyimage.com/240x300/0f172a/ffffff.png&text=Story',
		doc: {
			pageFill: '#0f172a',
			nodes: [
				{
					kind: 'text',
					id: 't-story-title',
					x: 48,
					y: 92,
					width: 720,
					rotation: 0,
					opacity: 1,
					draggable: true,
					text: 'YOUR TITLE',
					fontSize: 84,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#ffffff',
					fontStyle: 'bold'
				},
				{
					kind: 'text',
					id: 't-story-caption',
					x: 48,
					y: 212,
					width: 720,
					rotation: 0,
					opacity: 0.9,
					draggable: true,
					text: 'Add a short caption here.',
					fontSize: 30,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#e2e8f0',
					fontStyle: 'normal'
				}
			]
		},
		aspectRatioId: '9:16',
		suggestAspectRatioId: '9:16'
	},
	{
		id: 'wide-banner',
		label: 'Wide banner',
		description: 'Headline + call to action.',
		previewUrl: 'https://dummyimage.com/240x300/334155/ffffff.png&text=Banner',
		doc: {
			pageFill: '#334155',
			nodes: [
				{
					kind: 'text',
					id: 't-banner-headline',
					x: 56,
					y: 84,
					width: 1000,
					rotation: 0,
					opacity: 1,
					draggable: true,
					text: 'Your headline',
					fontSize: 70,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#ffffff',
					fontStyle: 'bold'
				},
				{
					kind: 'text',
					id: 't-banner-cta',
					x: 56,
					y: 170,
					width: 1000,
					rotation: 0,
					opacity: 0.92,
					draggable: true,
					text: 'Call to action →',
					fontSize: 30,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#e2e8f0',
					fontStyle: 'normal'
				}
			]
		},
		aspectRatioId: '16:9',
		suggestAspectRatioId: '16:9'
	},
	{
		id: 'square-post',
		label: 'Square post',
		description: 'Title + subtitle.',
		previewUrl: 'https://dummyimage.com/240x300/fce7f3/111827.png&text=Post',
		doc: {
			pageFill: '#fce7f3',
			nodes: [
				{
					kind: 'text',
					id: 't-square-title',
					x: 52,
					y: 98,
					width: 760,
					rotation: 0,
					opacity: 1,
					draggable: true,
					text: 'SQUARE TITLE',
					fontSize: 72,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#111827',
					fontStyle: 'bold'
				},
				{
					kind: 'text',
					id: 't-square-subtitle',
					x: 52,
					y: 194,
					width: 760,
					rotation: 0,
					opacity: 0.9,
					draggable: true,
					text: 'Subtitle goes here',
					fontSize: 30,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#334155',
					fontStyle: 'normal'
				}
			]
		},
		aspectRatioId: '1:1',
		suggestAspectRatioId: '1:1'
	},
	{
		id: 'portrait-card',
		label: 'Portrait card',
		description: 'Title + body + footer.',
		previewUrl: 'https://dummyimage.com/240x300/f8fafc/111827.png&text=Card',
		doc: {
			pageFill: '#f8fafc',
			nodes: [
				{
					kind: 'text',
					id: 't-card-title',
					x: 52,
					y: 86,
					width: 760,
					rotation: 0,
					opacity: 1,
					draggable: true,
					text: 'Card title',
					fontSize: 64,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#0f172a',
					fontStyle: 'bold'
				},
				{
					kind: 'text',
					id: 't-card-body',
					x: 52,
					y: 172,
					width: 760,
					rotation: 0,
					opacity: 0.95,
					draggable: true,
					text: 'Write your message here. Keep it short and scannable.',
					fontSize: 28,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#334155',
					fontStyle: 'normal'
				},
				{
					kind: 'text',
					id: 't-card-footer',
					x: 52,
					y: 298,
					width: 760,
					rotation: 0,
					opacity: 0.85,
					draggable: true,
					text: 'yourbrand.com',
					fontSize: 22,
					fontFamily: 'Roboto, system-ui, sans-serif',
					fill: '#475569',
					fontStyle: 'normal'
				}
			]
		},
		aspectRatioId: '4:5',
		suggestAspectRatioId: '4:5'
	}
];
