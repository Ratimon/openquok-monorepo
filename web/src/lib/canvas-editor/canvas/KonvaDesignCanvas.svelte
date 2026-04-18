<script lang="ts">
	import { onMount } from 'svelte';

	import { icons } from '$data/icon';
	import type { CanvasSelectionState, KonvaCanvasApi, TextPresetId } from '$lib/canvas-editor/canvas/konvaCanvasApi';
	import type { KonvaDesignDoc, KonvaDesignImageNode } from '$lib/canvas-editor/utils/canvasDoc';
	import type { AspectRatioPreset } from '$lib/canvas-editor/utils/aspectRatioPresets';
	import { DEFAULT_ASPECT_RATIO_ID, getAspectPresetById } from '$lib/canvas-editor/utils/aspectRatioPresets';
	import { GRID_STEP, computePageLayout, drawBackgroundGrid } from '$lib/canvas-editor/canvas/helpers';
	import { loadKonva } from '$lib/canvas-editor/canvas/loadKonva';
	import { HistoryStack } from '$lib/canvas-editor/utils/historyStack';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		onReady?: (api: KonvaCanvasApi) => void;
		embedded?: boolean;
		aspectPreset?: AspectRatioPreset;
		/** Fired when undo/redo availability changes. */
		onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
		/** Fired when the selected element or its opacity/lock state changes. */
		onSelectionChange?: (state: CanvasSelectionState) => void;
	};

	let {
		onReady,
		embedded = false,
		aspectPreset = getAspectPresetById(DEFAULT_ASPECT_RATIO_ID),
		onHistoryChange,
		onSelectionChange
	}: Props = $props();

	const presetRef: { current: AspectRatioPreset } = {
		current: getAspectPresetById(DEFAULT_ASPECT_RATIO_ID)
	};

	let relayout: (() => void) | undefined;

	$effect(() => {
		presetRef.current = aspectPreset;
		relayout?.();
	});

	let host: HTMLDivElement | undefined;
	let fileInput = $state.raw<HTMLInputElement | undefined>(undefined);
	let addImageFromFile = $state<((file: File) => void) | undefined>(undefined);

	let teardown: (() => void) | undefined;
	let resizeObserver: ResizeObserver | undefined;

	onMount(() => {
		let cancelled = false;
		void (async () => {
			const Konva = await loadKonva();
			if (cancelled || !host) return;

			type KonvaImage = InstanceType<typeof Konva.Image>;
			type KonvaText = InstanceType<typeof Konva.Text>;
			type KonvaRect = InstanceType<typeof Konva.Rect>;
			type DesignNode = KonvaImage | KonvaText;

			const TEXT_PRESETS: Record<
				TextPresetId,
				{ text: string; fontSize: number; fontStyle: string }
			> = {
				header: { text: 'Add a heading', fontSize: 76, fontStyle: 'bold' },
				subheader: { text: 'Add a subheading', fontSize: 44, fontStyle: 'normal' },
				body: { text: 'Start with body text', fontSize: 30, fontStyle: 'normal' }
			};

			let stage: InstanceType<typeof Konva.Stage>;
			let pageRect: KonvaRect;
			let pageLayer: InstanceType<typeof Konva.Layer>;
			let contentLayer: InstanceType<typeof Konva.Layer>;
			let transformer: InstanceType<typeof Konva.Transformer>;
			let bgLayer: InstanceType<typeof Konva.Layer>;

			const history = new HistoryStack<KonvaDesignDoc>(50);
			let historyMuted = false;

			function notifyHistory() {
				onHistoryChange?.({
					canUndo: history.canUndo(),
					canRedo: history.canRedo()
				});
			}

			function getSelectionState(): CanvasSelectionState {
				const n = getSelectedNode();
				if (!n) {
					return { hasSelection: false, opacity: 100, locked: false };
				}
				if (n.getClassName() === 'Text') {
					const t = n as KonvaText;
					const fill = t.fill();
					const align = (t.align?.() ?? 'left') as NonNullable<CanvasSelectionState['text']>['align'];
					return {
						hasSelection: true,
						type: 'text',
						opacity: Math.round((t.opacity() ?? 1) * 100),
						locked: !t.draggable(),
						text: {
							value: t.text(),
							fontFamily: t.fontFamily(),
							fontSize: t.fontSize(),
							fill: typeof fill === 'string' ? fill : '#0f172a',
							fontStyle: t.fontStyle(),
							align
						}
					};
				}
				return {
					hasSelection: true,
					type: 'image',
					opacity: Math.round((n.opacity() ?? 1) * 100),
					locked: !n.draggable()
				};
			}

			function notifySelection() {
				onSelectionChange?.(getSelectionState());
			}

			function getSelectedNode(): DesignNode | undefined {
				const nodes = transformer.nodes();
				if (nodes.length !== 1) return undefined;
				const n = nodes[0];
				const cn = n.getClassName();
				if (cn === 'Image') return n as KonvaImage;
				if (cn === 'Text') return n as KonvaText;
				return undefined;
			}

			function ensureTransformerOnTop() {
				transformer.moveToTop();
			}

			function getStageSize() {
				const w = Math.max(320, Math.floor(host?.clientWidth ?? 400));
				const h = Math.max(320, Math.floor(host?.clientHeight ?? 400));
				return { w, h };
			}

			function layoutPage(sw: number, sh: number) {
				return computePageLayout(sw, sh, embedded, presetRef.current);
			}

			function drawGrid(layer: InstanceType<typeof Konva.Layer>, sw: number, sh: number) {
				drawBackgroundGrid(Konva, layer, sw, sh, GRID_STEP);
			}

			function captureDoc(): KonvaDesignDoc {
				const fill = pageRect.fill();
				const pageFill = typeof fill === 'string' ? fill : '#ffffff';
				const nodes: KonvaDesignDoc['nodes'] = [];
				for (const node of contentLayer.getChildren()) {
					const cn = node.getClassName();
					if (cn === 'Image') {
						const img = node as KonvaImage;
						const el = img.image() as HTMLImageElement | undefined;
						if (!el?.src) continue;
						nodes.push({
							kind: 'image',
							id: img.id() || img.name(),
							x: img.x(),
							y: img.y(),
							width: img.width(),
							height: img.height(),
							rotation: img.rotation(),
							opacity: img.opacity() ?? 1,
							draggable: img.draggable(),
							src: el.src
						});
					} else if (cn === 'Text') {
						const t = node as KonvaText;
						const f = t.fill();
						nodes.push({
							kind: 'text',
							id: t.id() || t.name(),
							x: t.x(),
							y: t.y(),
							width: t.width(),
							rotation: t.rotation(),
							opacity: t.opacity() ?? 1,
							draggable: t.draggable(),
							text: t.text(),
							fontSize: t.fontSize(),
							fontFamily: t.fontFamily(),
							fill: typeof f === 'string' ? f : '#0f172a',
							fontStyle: t.fontStyle()
						});
					}
				}
				nodes.sort((a, b) => a.id.localeCompare(b.id));
				return { pageFill, nodes };
			}

			function pushHistory() {
				if (historyMuted) return;
				history.push(captureDoc());
				notifyHistory();
			}

			function clearSelection() {
				transformer.nodes([]);
				contentLayer.batchDraw();
				notifySelection();
			}

			function selectNode(node: DesignNode) {
				transformer.nodes([node]);
				transformer.moveToTop();
				contentLayer.batchDraw();
				notifySelection();
			}

			function attachImageHandlers(kImg: KonvaImage) {
				kImg.on('dragend', () => {
					const box = pageInnerBox();
					const minX = box.px + 4;
					const minY = box.py + 4;
					const maxX = box.px + box.pw - kImg.width() - 4;
					const maxY = box.py + box.ph - kImg.height() - 4;
					let nx = kImg.x();
					let ny = kImg.y();
					nx = Math.min(Math.max(nx, minX), maxX);
					ny = Math.min(Math.max(ny, minY), maxY);
					kImg.position({ x: nx, y: ny });
					contentLayer.batchDraw();
					pushHistory();
				});
			}

			function attachTextHandlers(t: KonvaText) {
				t.on('dragend', () => {
					const box = pageInnerBox();
					const pad = 4;
					const rect = t.getClientRect();

					// Align Konva's `x/y` to the clientRect origin (accounts for font metrics and transforms).
					const dx = t.x() - rect.x;
					const dy = t.y() - rect.y;

					const viewW = Math.max(1, box.pw - pad * 2);
					const viewH = Math.max(1, box.ph - pad * 2);

					// If narrower than page: clamp within [left, right - width].
					// If wider than page: allow sliding within [right - width, left].
					const minRectX = box.px + pad - Math.max(0, rect.width - viewW);
					const maxRectX = box.px + pad + Math.max(0, viewW - rect.width);

					const minRectY = box.py + pad - Math.max(0, rect.height - viewH);
					const maxRectY = box.py + pad + Math.max(0, viewH - rect.height);

					const nxRect = Math.min(Math.max(rect.x, minRectX), maxRectX);
					const nyRect = Math.min(Math.max(rect.y, minRectY), maxRectY);

					t.position({ x: nxRect + dx, y: nyRect + dy });
					contentLayer.batchDraw();
					pushHistory();
				});
			}

			function addKonvaImageFromHtml(img: HTMLImageElement, node: KonvaDesignImageNode) {
				const kImg = new Konva.Image({
					id: node.id,
					image: img,
					x: node.x,
					y: node.y,
					width: node.width,
					height: node.height,
					rotation: node.rotation,
					opacity: node.opacity ?? 1,
					draggable: node.draggable !== false,
					name: 'design-image'
				});
				attachImageHandlers(kImg);
				contentLayer.add(kImg);
			}

			async function applyDoc(doc: KonvaDesignDoc) {
				historyMuted = true;
				clearSelection();
				for (const node of [...contentLayer.getChildren()]) {
					const cn = node.getClassName();
					if (cn === 'Image' || cn === 'Text') node.destroy();
				}
				pageRect.fill(doc.pageFill);
				pageLayer.batchDraw();

				const images = doc.nodes.filter((n): n is KonvaDesignImageNode => n.kind === 'image');
				const texts = doc.nodes.filter((n) => n.kind === 'text');

				for (const n of texts) {
					const t = new Konva.Text({
						id: n.id,
						text: n.text,
						fontSize: n.fontSize,
						fontFamily: n.fontFamily,
						fontStyle: n.fontStyle,
						fill: n.fill,
						width: n.width,
						x: n.x,
						y: n.y,
						rotation: n.rotation,
						opacity: n.opacity ?? 1,
						draggable: n.draggable !== false,
						name: 'design-text'
					});
					attachTextHandlers(t);
					contentLayer.add(t);
				}

				await Promise.all(
					images.map(
						(n) =>
							new Promise<void>((resolve) => {
								const im = new Image();
								im.crossOrigin = 'anonymous';
								im.onload = () => {
									addKonvaImageFromHtml(im, n);
									resolve();
								};
								im.onerror = () => resolve();
								im.src = n.src;
							})
					)
				);

				contentLayer.batchDraw();
				historyMuted = false;
				notifyHistory();
				notifySelection();
			}

			function applyTemplateDoc(doc: KonvaDesignDoc) {
				void applyDoc(doc).then(() => {
					history.clear(captureDoc());
					notifyHistory();
					notifySelection();
				});
			}

			function syncPageRect() {
				const { w: sw, h: sh } = getStageSize();
				stage.width(sw);
				stage.height(sh);
				const { px, py, pw, ph } = layoutPage(sw, sh);
				pageRect.position({ x: px, y: py });
				pageRect.width(pw);
				pageRect.height(ph);
				drawGrid(bgLayer, sw, sh);
				bgLayer.batchDraw();
				pageLayer.batchDraw();
				contentLayer.batchDraw();
			}

			const { w: sw0, h: sh0 } = getStageSize();
			stage = new Konva.Stage({
				container: host!,
				width: sw0,
				height: sh0
			});

			bgLayer = new Konva.Layer();
			drawGrid(bgLayer, sw0, sh0);

			pageRect = new Konva.Rect({
				x: 0,
				y: 0,
				width: 400,
				height: 500,
				fill: '#ffffff',
				stroke: '#cbd5e1',
				strokeWidth: 1,
				cornerRadius: 4,
				shadowColor: 'rgba(15,23,42,0.12)',
				shadowBlur: 24,
				shadowOffsetY: 6,
				name: 'page'
			});

			pageLayer = new Konva.Layer();
			pageLayer.add(pageRect);

			contentLayer = new Konva.Layer();
			transformer = new Konva.Transformer({
				rotateEnabled: true,
				borderStroke: '#6366f1',
				anchorFill: '#ffffff',
				anchorStroke: '#6366f1',
				boundBoxFunc: (oldBox, newBox) => {
					if (newBox.width < 16 || newBox.height < 16) return oldBox;
					return newBox;
				}
			});
			contentLayer.add(transformer);

			transformer.on('transformend', () => {
				pushHistory();
				notifySelection();
			});

			stage.add(bgLayer);
			stage.add(pageLayer);
			stage.add(contentLayer);

			syncPageRect();
			relayout = syncPageRect;

			history.clear(captureDoc());
			notifyHistory();
			notifySelection();

			stage.on('click tap', (e) => {
				const clicked = e.target;
				const cn = clicked.getClassName();
				if (cn === 'Image') {
					selectNode(clicked as KonvaImage);
					return;
				}
				if (cn === 'Text') {
					selectNode(clicked as KonvaText);
					return;
				}
				clearSelection();
			});

			let editingTextId: string | null = null;

			function startTextEditing(t: KonvaText, opts?: { selectAll?: boolean }) {
				if (!host) return;
				if (editingTextId === (t.id() || t.name())) return;
				editingTextId = t.id() || t.name();
				const hostEl = host;
				const stagePos = stage.container().getBoundingClientRect();
				const absPos = t.getAbsolutePosition();

				const area = document.createElement('textarea');
				area.value = t.text();
				area.style.position = 'fixed';
				area.style.left = `${stagePos.left + absPos.x}px`;
				area.style.top = `${stagePos.top + absPos.y}px`;
				area.style.width = `${Math.max(48, t.width())}px`;
				area.style.height = `${Math.max(32, t.height())}px`;
				area.style.padding = '0';
				area.style.margin = '0';
				area.style.border = '1px solid rgba(99,102,241,0.6)';
				area.style.outline = 'none';
				area.style.resize = 'none';
				area.style.background = 'rgba(255,255,255,0.92)';
				area.style.color = typeof t.fill() === 'string' ? (t.fill() as string) : '#0f172a';
				area.style.fontFamily = t.fontFamily();
				area.style.fontSize = `${t.fontSize()}px`;
				area.style.fontStyle = t.fontStyle();
				area.style.lineHeight = '1.15';
				area.style.zIndex = '9999';

				// Hide the Konva node while editing to avoid double-render.
				t.visible(false);
				contentLayer.batchDraw();

				const commit = (cancel = false) => {
					if (!cancel) {
						t.text(area.value);
						t.visible(true);
						contentLayer.batchDraw();
						pushHistory();
						notifySelection();
					} else {
						t.visible(true);
						contentLayer.batchDraw();
						notifySelection();
					}
					area.remove();
					editingTextId = null;
				};

				area.addEventListener('input', () => {
					t.text(area.value);
					if (t.getAttr('autoWidth')) {
						const box = pageInnerBox();
						const maxWidth = Math.max(64, box.pw - 24);
						const fitted = Math.min(maxWidth, Math.max(48, (t.getTextWidth?.() ?? 0) + 12));
						t.width(fitted);
					}
					contentLayer.batchDraw();
					notifySelection();
				});

				area.addEventListener('keydown', (ev) => {
					if (ev.key === 'Escape') {
						ev.preventDefault();
						commit(true);
					}
					// Cmd/Ctrl+Enter commits.
					if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) {
						ev.preventDefault();
						commit(false);
					}
				});

				area.addEventListener('blur', () => commit(false));

				document.body.appendChild(area);
				area.focus();
				if (opts?.selectAll ?? true) {
					area.select();
				} else {
					area.selectionStart = area.selectionEnd = area.value.length;
				}
				return area;
			}

			stage.on('dblclick dbltap', (e) => {
				const clicked = e.target;
				if (clicked.getClassName() !== 'Text') return;
				const t = clicked as KonvaText;
				selectNode(t);
				startTextEditing(t);
			});

			function shouldIgnoreKeyTarget(el: Element | null) {
				if (!el) return false;
				const tag = el.tagName?.toLowerCase();
				if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
				return (el as HTMLElement).isContentEditable;
			}

			function insertAtCursor(area: HTMLTextAreaElement, text: string) {
				const start = area.selectionStart ?? area.value.length;
				const end = area.selectionEnd ?? area.value.length;
				area.value = area.value.slice(0, start) + text + area.value.slice(end);
				const next = start + text.length;
				area.selectionStart = next;
				area.selectionEnd = next;
				area.dispatchEvent(new Event('input', { bubbles: true }));
			}

			function deleteAtCursor(area: HTMLTextAreaElement, mode: 'backspace' | 'delete') {
				const start = area.selectionStart ?? area.value.length;
				const end = area.selectionEnd ?? area.value.length;
				if (start !== end) {
					area.value = area.value.slice(0, start) + area.value.slice(end);
					area.selectionStart = start;
					area.selectionEnd = start;
					area.dispatchEvent(new Event('input', { bubbles: true }));
					return;
				}
				if (mode === 'backspace' && start > 0) {
					area.value = area.value.slice(0, start - 1) + area.value.slice(end);
					area.selectionStart = start - 1;
					area.selectionEnd = start - 1;
					area.dispatchEvent(new Event('input', { bubbles: true }));
				}
				if (mode === 'delete' && start < area.value.length) {
					area.value = area.value.slice(0, start) + area.value.slice(start + 1);
					area.selectionStart = start;
					area.selectionEnd = start;
					area.dispatchEvent(new Event('input', { bubbles: true }));
				}
			}

			function onWindowKeyDown(ev: KeyboardEvent) {
				if (editingTextId) return;
				if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
				if (shouldIgnoreKeyTarget(document.activeElement)) return;
				const n = getSelectedNode();

				const isDeleteKey = ev.key === 'Delete' || ev.key === 'Backspace';
				if (n && n.getClassName() === 'Image' && isDeleteKey) {
					ev.preventDefault();
					ev.stopPropagation();
					removeSelected();
					return;
				}

				if (!n || n.getClassName() !== 'Text') return;

				// Start edit mode on typing or backspace/delete.
				const k = ev.key;
				const isPrintable = k.length === 1 && !ev.isComposing;
				const isBackspace = k === 'Backspace';
				const isDelete = k === 'Delete';
				if (!isPrintable && !isBackspace && !isDelete) return;

				ev.preventDefault();
				ev.stopPropagation();
				const t = n as KonvaText;
				const area = startTextEditing(t, { selectAll: false });
				if (!area) return;

				if (isPrintable) insertAtCursor(area, k);
				if (isBackspace) deleteAtCursor(area, 'backspace');
				if (isDelete) deleteAtCursor(area, 'delete');
			}

			window.addEventListener('keydown', onWindowKeyDown, true);

			function pageInnerBox() {
				const { w: sw, h: sh } = getStageSize();
				return layoutPage(sw, sh);
			}

			function addImageFromHtmlImage(img: HTMLImageElement) {
				const { px, py, pw, ph } = pageInnerBox();
				let w = img.naturalWidth;
				let h = img.naturalHeight;
				const maxW = pw - 24;
				const maxH = ph - 24;
				const scale = Math.min(maxW / w, maxH / h, 1);
				w *= scale;
				h *= scale;
				const id = crypto.randomUUID();
				const kImg = new Konva.Image({
					id,
					image: img,
					x: px + (pw - w) / 2,
					y: py + (ph - h) / 2,
					width: w,
					height: h,
					draggable: true,
					name: 'design-image'
				});
				attachImageHandlers(kImg);
				contentLayer.add(kImg);
				selectNode(kImg);
				contentLayer.batchDraw();
				pushHistory();
			}

			function addTextFromPreset(
				preset: TextPresetId,
				stageX?: number,
				stageY?: number,
				fontFamily = 'Roboto, system-ui, sans-serif'
			) {
				const { px, py, pw, ph } = pageInnerBox();
				const scale = (pw + ph) / 2160;
				const p = TEXT_PRESETS[preset];
				const fs = p.fontSize * scale;
				const maxWidth = Math.max(64, pw - 24);
				const y =
					stageY != null ? stageY - fs / 2 : py + (ph - fs) / 2;
				const t = new Konva.Text({
					id: crypto.randomUUID(),
					text: p.text,
					fontSize: fs,
					fontFamily,
					fontStyle: p.fontStyle,
					fill: '#0f172a',
					// Let Konva compute natural width; we auto-fit below.
					x: px + 12,
					y,
					rotation: 0,
					draggable: true,
					name: 'design-text'
				});
				// Auto-fit width to actual glyphs so transformer matches text length.
				t.setAttr('autoWidth', true);
				const fitted = Math.min(maxWidth, Math.max(48, (t.getTextWidth?.() ?? 0) + 12));
				t.width(fitted);
				const x = stageX != null ? stageX - fitted / 2 : px + (pw - fitted) / 2;
				t.x(x);
				attachTextHandlers(t);
				contentLayer.add(t);
				selectNode(t);
				contentLayer.batchDraw();
				pushHistory();
			}

			function retargetTextFontFamily(fromFamily: string, toFamily: string) {
				for (const node of contentLayer.getChildren()) {
					if (node.getClassName() !== 'Text') continue;
					const t = node as KonvaText;
					if (t.fontFamily() === fromFamily) {
						t.fontFamily(toFamily);
					}
				}
				contentLayer.batchDraw();
				pushHistory();
			}

			function loadImageFromFile(file: File) {
				const url = URL.createObjectURL(file);
				const im = new Image();
				im.onload = () => {
					addImageFromHtmlImage(im);
					/* Keep blob URL valid for undo snapshots while the node exists. */
				};
				im.onerror = () => URL.revokeObjectURL(url);
				im.crossOrigin = 'anonymous';
				im.src = url;
			}

			addImageFromFile = loadImageFromFile;

			function loadImageFromRemoteUrl(url: string) {
				const im = new Image();
				im.crossOrigin = 'anonymous';
				im.onload = () => addImageFromHtmlImage(im);
				im.onerror = () => {
					/* ignore failed preview loads */
				};
				im.src = url;
			}

			function runUndo() {
				const target = history.undo();
				if (target) void applyDoc(target);
			}

			function runRedo() {
				const target = history.redo();
				if (target) void applyDoc(target);
			}

			function canMoveSelectedForward(): boolean {
				const n = getSelectedNode();
				if (!n) return false;
				const ch = contentLayer.getChildren();
				const i = ch.indexOf(n);
				return i >= 0 && i < ch.length - 2;
			}

			function canMoveSelectedBackward(): boolean {
				const n = getSelectedNode();
				if (!n) return false;
				const i = contentLayer.getChildren().indexOf(n);
				return i > 0;
			}

			function removeSelected() {
				const n = getSelectedNode();
				if (!n) return;
				n.destroy();
				clearSelection();
				pushHistory();
			}

			function clearAllImages() {
				for (const node of [...contentLayer.getChildren()]) {
					const cn = node.getClassName();
					if (cn === 'Image' || cn === 'Text') node.destroy();
				}
				clearSelection();
				contentLayer.batchDraw();
				pushHistory();
			}

			function duplicateSelected() {
				const n = getSelectedNode();
				if (!n) return;
				if (n.getClassName() === 'Text') {
					const t = n as KonvaText;
					const fill = t.fill();
					const dup = new Konva.Text({
						id: crypto.randomUUID(),
						text: t.text(),
						fontSize: t.fontSize(),
						fontFamily: t.fontFamily(),
						fontStyle: t.fontStyle(),
						fill: typeof fill === 'string' ? fill : '#0f172a',
						width: t.width(),
						x: t.x() + 12,
						y: t.y() + 12,
						rotation: t.rotation(),
						opacity: t.opacity(),
						draggable: t.draggable() !== false,
						name: 'design-text'
					});
					attachTextHandlers(dup);
					contentLayer.add(dup);
					selectNode(dup);
					pushHistory();
					return;
				}
				const img = n as KonvaImage;
				const el = img.image() as HTMLImageElement | undefined;
				const src = el?.src;
				if (!src) return;
				const im = new Image();
				im.crossOrigin = 'anonymous';
				im.onload = () => {
					const id = crypto.randomUUID();
					const dup = new Konva.Image({
						id,
						image: im,
						x: img.x() + 12,
						y: img.y() + 12,
						width: img.width(),
						height: img.height(),
						rotation: img.rotation(),
						opacity: img.opacity(),
						draggable: img.draggable() !== false,
						name: 'design-image'
					});
					attachImageHandlers(dup);
					contentLayer.add(dup);
					selectNode(dup);
					pushHistory();
				};
				im.onerror = () => {};
				im.src = src;
			}

			function setSelectedOpacity(percent: number) {
				const n = getSelectedNode();
				if (!n) return;
				const p = Math.max(0, Math.min(100, percent));
				n.opacity(p / 100);
				contentLayer.batchDraw();
				notifySelection();
			}

			function setSelectedLocked(locked: boolean) {
				const n = getSelectedNode();
				if (!n) return;
				n.draggable(!locked);
				contentLayer.batchDraw();
				pushHistory();
				notifySelection();
			}

			function moveSelectedForward() {
				const n = getSelectedNode();
				if (!n || !canMoveSelectedForward()) return;
				n.moveUp();
				ensureTransformerOnTop();
				transformer.nodes([n]);
				contentLayer.batchDraw();
				pushHistory();
				notifySelection();
			}

			function moveSelectedBackward() {
				const n = getSelectedNode();
				if (!n || !canMoveSelectedBackward()) return;
				n.moveDown();
				ensureTransformerOnTop();
				transformer.nodes([n]);
				contentLayer.batchDraw();
				pushHistory();
				notifySelection();
			}

			function moveSelectedToFront() {
				const n = getSelectedNode();
				if (!n) return;
				while (canMoveSelectedForward()) {
					n.moveUp();
				}
				ensureTransformerOnTop();
				transformer.nodes([n]);
				contentLayer.batchDraw();
				pushHistory();
				notifySelection();
			}

			function moveSelectedToBack() {
				const n = getSelectedNode();
				if (!n) return;
				while (canMoveSelectedBackward()) {
					n.moveDown();
				}
				ensureTransformerOnTop();
				transformer.nodes([n]);
				contentLayer.batchDraw();
				pushHistory();
				notifySelection();
			}

			function alignSelected(
				mode: 'left' | 'centerH' | 'right' | 'top' | 'centerV' | 'bottom'
			) {
				const n = getSelectedNode();
				if (!n) return;
				const box = pageInnerBox();
				const pad = 4;
				const w = n.width();
				const h = n.height();
				let x = n.x();
				let y = n.y();
				if (mode === 'left') x = box.px + pad;
				if (mode === 'centerH') x = box.px + (box.pw - w) / 2;
				if (mode === 'right') x = box.px + box.pw - w - pad;
				if (mode === 'top') y = box.py + pad;
				if (mode === 'centerV') y = box.py + (box.ph - h) / 2;
				if (mode === 'bottom') y = box.py + box.ph - h - pad;
				n.position({ x, y });
				contentLayer.batchDraw();
				pushHistory();
				notifySelection();
			}

			const api: KonvaCanvasApi = {
				async toPngBlob() {
					const box = pageInnerBox();
					const { exportWidth } = presetRef.current;
					const pixelRatio = exportWidth / box.pw;
					return new Promise<Blob | null>((resolve) => {
						stage.toBlob({
							x: box.px,
							y: box.py,
							width: box.pw,
							height: box.ph,
							pixelRatio,
							mimeType: 'image/png',
							callback: (blob: Blob | null) => resolve(blob)
						});
					});
				},
				addImageFromUrl: (url: string) => loadImageFromRemoteUrl(url),
				addImageFromFile: (file: File) => loadImageFromFile(file),
				setPageBackground: (cssColor: string) => {
					pageRect.fill(cssColor);
					pageLayer.batchDraw();
					pushHistory();
				},
				applyTemplateDoc: (doc: KonvaDesignDoc) => applyTemplateDoc(doc),
				addTextPreset: (preset: TextPresetId, opts?: { dropX?: number; dropY?: number; fontFamily?: string }) =>
					addTextFromPreset(preset, opts?.dropX, opts?.dropY, opts?.fontFamily),
				retargetTextFontFamily,
				clearAllImages,
				undo: () => {
					runUndo();
				},
				redo: () => {
					runRedo();
				},
				canUndo: () => history.canUndo(),
				canRedo: () => history.canRedo(),
				getSelectionState,
				setSelectedText: (value: string) => {
					const n = getSelectedNode();
					if (!n || n.getClassName() !== 'Text') return;
					const t = n as KonvaText;
					t.text(value);
					contentLayer.batchDraw();
					notifySelection();
				},
				setSelectedFontFamily: (fontFamily: string) => {
					const n = getSelectedNode();
					if (!n || n.getClassName() !== 'Text') return;
					const t = n as KonvaText;
					t.fontFamily(fontFamily);
					contentLayer.batchDraw();
					pushHistory();
					notifySelection();
				},
				setSelectedFontSize: (px: number) => {
					const n = getSelectedNode();
					if (!n || n.getClassName() !== 'Text') return;
					const t = n as KonvaText;
					t.fontSize(Math.max(6, px));
					contentLayer.batchDraw();
					pushHistory();
					notifySelection();
				},
				setSelectedFill: (cssColor: string) => {
					const n = getSelectedNode();
					if (!n || n.getClassName() !== 'Text') return;
					const t = n as KonvaText;
					t.fill(cssColor);
					contentLayer.batchDraw();
					pushHistory();
					notifySelection();
				},
				toggleSelectedBold: () => {
					const n = getSelectedNode();
					if (!n || n.getClassName() !== 'Text') return;
					const t = n as KonvaText;
					const cur = t.fontStyle() || 'normal';
					t.fontStyle(cur.includes('bold') ? cur.replace('bold', '').trim() || 'normal' : `${cur} bold`.trim());
					contentLayer.batchDraw();
					pushHistory();
					notifySelection();
				},
				toggleSelectedItalic: () => {
					const n = getSelectedNode();
					if (!n || n.getClassName() !== 'Text') return;
					const t = n as KonvaText;
					const cur = t.fontStyle() || 'normal';
					t.fontStyle(cur.includes('italic') ? cur.replace('italic', '').trim() || 'normal' : `${cur} italic`.trim());
					contentLayer.batchDraw();
					pushHistory();
					notifySelection();
				},
				setSelectedTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => {
					const n = getSelectedNode();
					if (!n || n.getClassName() !== 'Text') return;
					const t = n as KonvaText;
					t.align(align);
					contentLayer.batchDraw();
					pushHistory();
					notifySelection();
				},
				removeSelected,
				duplicateSelected,
				setSelectedOpacity,
				setSelectedLocked,
				moveSelectedForward,
				moveSelectedBackward,
				moveSelectedToFront,
				moveSelectedToBack,
				alignSelected,
				canMoveSelectedForward,
				canMoveSelectedBackward,
				commitEdit: () => {
					pushHistory();
				}
			};

			const hostEl = host!;

			function onHostDragOver(e: DragEvent) {
				e.preventDefault();
				if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
			}

			function onHostDrop(e: DragEvent) {
				e.preventDefault();
				const raw = e.dataTransfer?.getData('application/json');
				if (!raw) return;
				try {
					const d = JSON.parse(raw) as {
						type?: string;
						preset?: TextPresetId;
						fontFamily?: string;
					};
					if (d.type !== 'design-text-preset' || !d.preset) return;
					const rect = hostEl.getBoundingClientRect();
					const sx = e.clientX - rect.left;
					const sy = e.clientY - rect.top;
					addTextFromPreset(d.preset, sx, sy, d.fontFamily);
				} catch {
					/* ignore malformed drop payloads */
				}
			}

			hostEl.addEventListener('dragover', onHostDragOver);
			hostEl.addEventListener('drop', onHostDrop);

			onReady?.(api);

			resizeObserver = new ResizeObserver(() => {
				if (cancelled || !host) return;
				syncPageRect();
			});
			resizeObserver.observe(hostEl);

			teardown = () => {
				window.removeEventListener('keydown', onWindowKeyDown, true);
				hostEl.removeEventListener('dragover', onHostDragOver);
				hostEl.removeEventListener('drop', onHostDrop);
				relayout = undefined;
				resizeObserver?.disconnect();
				resizeObserver = undefined;
				stage.destroy();
				teardown = undefined;
			};
		})();

		return () => {
			cancelled = true;
			addImageFromFile = undefined;
			relayout = undefined;
			teardown?.();
		};
	});

	function onFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (file?.type.startsWith('image/')) {
			addImageFromFile?.(file);
		}
		input.value = '';
	}
</script>

<div
	class="flex min-h-0 w-full flex-col gap-3"
	class:h-full={embedded}
	class:flex-1={embedded}
>
	<div
		class="border-base-300 bg-base-300/35 flex w-full min-h-0 flex-col overflow-hidden rounded-lg border shadow-inner"
		class:min-h-[min(60vh,560px)]={!embedded}
		class:h-[min(60vh,560px)]={!embedded}
		class:flex-1={embedded}
		class:min-h-0={embedded}
	>
		<div bind:this={host} class="h-full min-h-0 w-full flex-1"></div>
	</div>
	{#if !embedded}
		<p class="text-base-content/60 text-xs">
			Grid and page frame show the export area. Add an image to select, resize, and rotate it.
		</p>
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			class="hidden"
			onchange={onFileChange}
		/>
		<Button
			type="button"
			variant="secondary"
			class="w-full max-w-md self-start"
			onclick={() => fileInput?.click()}
			disabled={!addImageFromFile}
		>
			<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
			Add image to canvas
		</Button>
	{/if}
</div>
