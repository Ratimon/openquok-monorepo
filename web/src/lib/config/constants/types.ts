export interface ModuleConfigSchema {
	[key: string]: {
		description: string;
		type: string;
		default: any;
		inputType: 'input' | 'select' | 'textarea' | 'switch';
		options?: { label: string; value: string }[];
		maxInputLength?: number;
	}
}