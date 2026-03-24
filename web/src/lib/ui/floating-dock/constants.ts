// https://animation-svelte.vercel.app/a/components/floating-dock

/**
 * Floating dock animation & layout config.
 *
 * Edit these values to change dock icon sizes and hover behavior.
 * All size values are in pixels unless noted.
 */

/** Width of each dock icon when not hovered (rest state). */
export const DOCK_ICON_WIDTH_REST = 40;

/** Width of the dock icon under the cursor (hover/focus). Increase for a stronger "lift" effect. */
export const DOCK_ICON_WIDTH_HOVER = 52;

/**
 * Input range for mouse distance used to interpolate width.
 * distance = mouseX - iconCenterX (roughly). When distance is 0 the icon is centered under the cursor.
 * [LEFT, CENTER, RIGHT] maps to [REST, HOVER, REST] width.
 */
export const DOCK_DISTANCE_INPUT_RANGE = [-110, 0, 110] as const;

/** Output width range: [rest, hover, rest]. Derived from REST and HOVER for consistency. */
export const DOCK_WIDTH_OUTPUT_RANGE: [number, number, number] = [
	DOCK_ICON_WIDTH_REST,
	DOCK_ICON_WIDTH_HOVER,
	DOCK_ICON_WIDTH_REST
];

/**
 * Distance value used when bounds are unknown or mouse is off (e.g. Infinity).
 * Must map to REST width (i.e. outside the left/right of DOCK_DISTANCE_INPUT_RANGE).
 */
export const DOCK_DISTANCE_FALLBACK = -200;

/** Spring that follows the interpolated width. Higher stiffness = snappier, less "float". */
export const DOCK_WIDTH_SPRING = {
	stiffness: 1200,
	damping: 50
} as const;

/** Motion pill transition when the icon container resizes (bounce feel). */
export const DOCK_PILL_TRANSITION = {
	bounceDamping: 300,
	bounceStiffness: 800,
	bounce: 0.3,
	duration: 0.8
} as const;

/** CSS scale of the icon on hover (e.g. 1.1 = scale-110). Purely visual, separate from pill width. */
export const DOCK_ICON_HOVER_SCALE = 1.1;
