<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	type PreserveAspectRatioAlign =
		| 'none'
		| 'xMinYMin'
		| 'xMidYMin'
		| 'xMaxYMin'
		| 'xMinYMid'
		| 'xMidYMid'
		| 'xMaxYMid'
		| 'xMinYMax'
		| 'xMidYMax'
		| 'xMaxYMax';

	type PreserveAspectRatioMeetOrSlice = 'meet' | 'slice';
	type PreserveAspectRatio =
		| PreserveAspectRatioAlign
		| `${Exclude<PreserveAspectRatioAlign, 'none'>} ${PreserveAspectRatioMeetOrSlice}`;

	interface TextAlongPathProps extends SVGAttributes<SVGSVGElement> {
		path: string;
		pathId?: string;
		pathClass?: string;
		preserveAspectRatio?: PreserveAspectRatio;
		showPath?: boolean;
		width?: string | number;
		height?: string | number;
		viewBox?: string;
		svgClass?: string;
		text: string;
		textClass?: string;
		textAnchor?: 'start' | 'middle' | 'end';
		duration?: number;
		repeatCount?: number | 'indefinite';
		easingFunction?: {
			calcMode?: string;
			keyTimes?: string;
			keySplines?: string;
		};
	}

	let {
		path,
		pathId,
		pathClass,
		preserveAspectRatio = 'xMidYMid meet',
		showPath = false,
		width = '100%',
		height = '100%',
		viewBox = '0 0 100 100',
		svgClass,
		text,
		textClass,
		textAnchor = 'start',
		duration = 4,
		repeatCount = 'indefinite',
		easingFunction = {},
		...props
	}: TextAlongPathProps = $props();

	const componentId = $props.id();

	let resolvedPathId = $derived(pathId ?? `animated-path-${componentId}`);
	let autoDuration = $derived(`${duration}s`);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	class={svgClass}
	{width}
	{height}
	{viewBox}
	{preserveAspectRatio}
	{...props}
>
	<path
		id={resolvedPathId}
		class={pathClass}
		d={path}
		stroke={showPath ? 'currentColor' : 'none'}
		fill="none"
	/>

	<text text-anchor={textAnchor} fill="currentColor">
		<textPath class={textClass} href={`#${resolvedPathId}`} startOffset="0%">
			<animate
				attributeName="startOffset"
				from="0%"
				to="100%"
				begin="0s"
				dur={autoDuration}
				{repeatCount}
				calcMode={easingFunction.calcMode}
				keyTimes={easingFunction.keyTimes}
				keySplines={easingFunction.keySplines}
			/>
			{text}
		</textPath>
	</text>

	<text text-anchor={textAnchor} fill="currentColor">
		<textPath class={textClass} href={`#${resolvedPathId}`} startOffset="-100%">
			<animate
				attributeName="startOffset"
				from="-100%"
				to="0%"
				begin="0s"
				dur={autoDuration}
				{repeatCount}
				calcMode={easingFunction.calcMode}
				keyTimes={easingFunction.keyTimes}
				keySplines={easingFunction.keySplines}
			/>
			{text}
		</textPath>
	</text>
</svg>
