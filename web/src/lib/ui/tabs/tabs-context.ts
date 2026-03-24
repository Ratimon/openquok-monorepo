import { getContext, setContext } from "svelte";

export type TabsOrientation = "horizontal" | "vertical";

export type TabsContextValue = {
	getValue: () => string | undefined;
	setValue: (next: string) => void;
	orientation: TabsOrientation;

	registerTrigger: (value: string, el: HTMLElement) => void;
	unregisterTrigger: (value: string, el: HTMLElement) => void;
	focusTriggerByValue: (value: string) => void;
	focusNextFrom: (currentValue: string, dir: 1 | -1) => void;
	focusEdge: (edge: "start" | "end") => void;
};

const TABS_CTX = Symbol("tabs");

export function setTabsContext(value: TabsContextValue) {
	setContext(TABS_CTX, value);
}

export function getTabsContext(): TabsContextValue {
	return getContext<TabsContextValue>(TABS_CTX);
}

