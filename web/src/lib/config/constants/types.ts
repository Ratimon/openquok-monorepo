export interface ModuleConfigSchema {
	[key: string]: {
		description: string;
		type: string;
		default: any;
		inputType: 'input' | 'select' | 'textarea' | 'switch' | 'faq';
		options?: { label: string; value: string }[];
		maxInputLength?: number;
	};
}