/** Section id is app-defined; this type is the generic nav item for the settings secondary sidebar. */
export interface SettingsNavItem<SectionId extends string = string> {
	id: SectionId;
	label: string;
}

/** Context provided by (protected) layout and consumed by SidebarSecondary. SectionId is app-defined. */
export interface SettingsSidebarContext<SectionId extends string = string> {
	navItems: SettingsNavItem<SectionId>[];
	getCurrentSection: () => string;
	getSectionTitle: () => string;
	getBasePath: () => string;
	/**
	 * Optional: allow consumers to build route-based hrefs instead of `?section=`.
	 * If omitted, SidebarSecondary defaults to `${basePath}?section=${id}`.
	 */
	getItemHref?: (id: string) => string;
	/** Optional: header title override (defaults to "Settings"). */
	getHeaderTitle?: () => string;
}
