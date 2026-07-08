import type { Component } from 'svelte';
import type { ClassValue } from 'svelte/elements';

export type CardPatternCell = [col: number, row: number];

export type CardPatternProps = {
	class?: ClassValue;
	pattern?: CardPatternCell[];
};

export type CardPatternComponent = Component<CardPatternProps>;
