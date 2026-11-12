import type { LaunchStepField } from '../../browser-extension/pageAssist.js';
import { DIRECTORY_EXTENSION_CONFIG_FIXTURES } from './index.js';
import {
	LAUNCH_FIELD_CATALOG_IDS,
	applySelectCoercionForField,
	choiceGroupControlCountBounds,
	filterItemsForLaunchField,
	resolveLaunchFieldCatalogId,
} from './fieldCatalogRegistry.js';

describe('fieldCatalogRegistry', () => {
	it('resolves catalog ids for fields in shipped extension_config fixtures', () => {
		for (const config of Object.values(DIRECTORY_EXTENSION_CONFIG_FIXTURES)) {
			for (const step of config.steps ?? []) {
				for (const field of step.fields ?? []) {
					if (field.tagsCatalog === 'uneed') {
						expect(resolveLaunchFieldCatalogId(field)).toBe(LAUNCH_FIELD_CATALOG_IDS['uneed:tags']);
					}
					if (field.selectCatalog === 'uneed') {
						expect(resolveLaunchFieldCatalogId(field)).toBe(LAUNCH_FIELD_CATALOG_IDS['uneed:select']);
					}
					if (field.checkboxCatalog === 'open_launch_categories') {
						expect(resolveLaunchFieldCatalogId(field)).toBe(
							LAUNCH_FIELD_CATALOG_IDS['open_launch:categories']
						);
					}
					if (field.checkboxCatalog === 'open_launch_platforms') {
						expect(resolveLaunchFieldCatalogId(field)).toBe(
							LAUNCH_FIELD_CATALOG_IDS['open_launch:platforms']
						);
					}
					if (field.selectCatalog === 'open_launch_pricing') {
						expect(resolveLaunchFieldCatalogId(field)).toBe(LAUNCH_FIELD_CATALOG_IDS['open_launch:pricing']);
					}
				}
			}
		}
	});

	it('maps Marketing alias to Marketing Tools via open_launch:categories', () => {
		const field: LaunchStepField = {
			key: 'categories',
			label: 'Categories',
			profilePath: 'profile_data.categories',
			fillMode: 'checkbox_group',
			checkboxCatalog: 'open_launch_categories',
		};
		expect(filterItemsForLaunchField(['Marketing', 'SaaS'], field)).toEqual(['Marketing Tools', 'SaaS']);
	});

	it('exposes checkbox-group size bounds for Open Launch catalogs only', () => {
		const platforms: LaunchStepField = {
			key: 'platforms',
			label: 'Platforms',
			profilePath: 'profile_data.platforms',
			fillMode: 'checkbox_group',
			checkboxCatalog: 'open_launch_platforms',
		};
		const categories: LaunchStepField = {
			key: 'categories',
			label: 'Categories',
			profilePath: 'profile_data.categories',
			fillMode: 'checkbox_group',
			checkboxCatalog: 'open_launch_categories',
		};
		expect(choiceGroupControlCountBounds(platforms)).toEqual({ min: 2, max: 10 });
		expect(choiceGroupControlCountBounds(categories)).toEqual({ min: 2, max: 500 });
		expect(choiceGroupControlCountBounds({ key: 'x', label: 'X', profilePath: 'x' })).toBeNull();
	});

	it('coerces Uneed category select values', () => {
		const field: LaunchStepField = {
			key: 'category',
			label: 'Category',
			profilePath: 'profile_data.category',
			fillMode: 'select',
			selectCatalog: 'uneed',
		};
		expect(applySelectCoercionForField('saas', field)).toBe('Business');
	});
});
