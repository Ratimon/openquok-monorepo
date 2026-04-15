<script lang="ts">
	type Props = {
		value?: string;
	};

	let { value = $bindable('#942828') }: Props = $props();

	type HSV = { h: number; s: number; v: number };

	function clamp(n: number, min: number, max: number) {
		return Math.min(max, Math.max(min, n));
	}

	function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
		const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
		if (!m) return null;
		const i = parseInt(m[1], 16);
		return { r: (i >> 16) & 255, g: (i >> 8) & 255, b: i & 255 };
	}

	function rgbToHex(r: number, g: number, b: number): string {
		const to = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
		return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
	}

	function rgbToHsv(r: number, g: number, b: number): HSV {
		const rn = r / 255;
		const gn = g / 255;
		const bn = b / 255;
		const max = Math.max(rn, gn, bn);
		const min = Math.min(rn, gn, bn);
		const d = max - min;

		let h = 0;
		if (d !== 0) {
			switch (max) {
				case rn:
					h = ((gn - bn) / d) % 6;
					break;
				case gn:
					h = (bn - rn) / d + 2;
					break;
				case bn:
					h = (rn - gn) / d + 4;
					break;
			}
			h *= 60;
			if (h < 0) h += 360;
		}
		const s = max === 0 ? 0 : d / max;
		const v = max;
		return { h, s, v };
	}

	function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
		const c = v * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = v - c;
		let rp = 0;
		let gp = 0;
		let bp = 0;

		if (h < 60) [rp, gp, bp] = [c, x, 0];
		else if (h < 120) [rp, gp, bp] = [x, c, 0];
		else if (h < 180) [rp, gp, bp] = [0, c, x];
		else if (h < 240) [rp, gp, bp] = [0, x, c];
		else if (h < 300) [rp, gp, bp] = [x, 0, c];
		else [rp, gp, bp] = [c, 0, x];

		return {
			r: (rp + m) * 255,
			g: (gp + m) * 255,
			b: (bp + m) * 255
		};
	}

	let hsv = $state<HSV>({ h: 0, s: 1, v: 1 });

	// Initialize from hex.
	$effect(() => {
		const rgb = hexToRgb(value);
		if (!rgb) return;
		hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
	});

	// Push hex when HSV changes.
	$effect(() => {
		const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v);
		const next = rgbToHex(r, g, b);
		if (next !== value) value = next;
	});

	let svEl: HTMLDivElement | null = $state(null);
	let hueEl: HTMLInputElement | null = $state(null);

	function setSvFromEvent(e: PointerEvent) {
		if (!svEl) return;
		const rect = svEl.getBoundingClientRect();
		const x = clamp(e.clientX - rect.left, 0, rect.width);
		const y = clamp(e.clientY - rect.top, 0, rect.height);
		const s = rect.width === 0 ? 0 : x / rect.width;
		const v = rect.height === 0 ? 0 : 1 - y / rect.height;
		hsv = { ...hsv, s, v };
	}

	function onSvPointerDown(e: PointerEvent) {
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		setSvFromEvent(e);
	}

	function onSvPointerMove(e: PointerEvent) {
		if (!(e.buttons & 1)) return;
		setSvFromEvent(e);
	}
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-end gap-4">
		<div class="flex flex-col gap-2">
			<div
				bind:this={svEl}
				class="relative h-[180px] w-[220px] overflow-hidden rounded-lg"
				style={`background: hsl(${hsv.h} 100% 50%)`}
				onpointerdown={onSvPointerDown}
				onpointermove={onSvPointerMove}
				role="application"
				aria-label="Color picker"
			>
				<div class="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
				<div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
				<div
					class="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
					style={`left:${hsv.s * 100}%; top:${(1 - hsv.v) * 100}%`}
				></div>
			</div>

			<input
				bind:this={hueEl}
				type="range"
				min="0"
				max="360"
				step="1"
				value={hsv.h}
				class="h-4 w-[220px] cursor-pointer appearance-none rounded-lg"
				style="background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);"
				oninput={(e) => (hsv = { ...hsv, h: Number((e.currentTarget as HTMLInputElement).value) })}
				aria-label="Hue"
			/>
		</div>

		<div class="flex items-center gap-3">
			<div class="h-6 w-6 rounded-md border border-base-300" style={`background:${value}`}></div>
			<input
				class="border-base-300 bg-base-100 w-[110px] rounded-md border px-2 py-1 text-sm uppercase"
				value={value}
				oninput={(e) => {
					const next = (e.currentTarget as HTMLInputElement).value.toUpperCase();
					// allow typing partial; only apply when valid
					if (/^#[0-9A-F]{0,6}$/.test(next)) value = next;
				}}
				onblur={() => {
					const rgb = hexToRgb(value);
					if (!rgb) value = '#942828';
				}}
				aria-label="Hex color"
			/>
		</div>
	</div>
</div>

