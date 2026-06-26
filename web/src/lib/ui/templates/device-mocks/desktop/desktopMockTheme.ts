import { tv } from 'tailwind-variants';

export const desktopMock = tv({
	slots: {
		root: 'mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center',
		screenFrame:
			'relative w-full min-h-0 flex-1 rounded-t-xl border-[6px] border-neutral-600 bg-neutral-600 shadow-xl dark:border-neutral-700 dark:bg-neutral-700 md:border-[8px]',
		screenInner: 'size-full min-h-0 overflow-hidden rounded-t-lg bg-base-100',
		keyboard:
			'relative w-[calc(100%+2rem)] shrink-0 rounded-b-xl rounded-t-sm bg-neutral-800 dark:bg-neutral-900 md:w-[calc(100%+3rem)]',
		keyboardBar: 'h-3 md:h-5',
		keyboardNotch:
			'absolute left-1/2 top-0 h-1 w-12 -translate-x-1/2 rounded-b-md bg-neutral-600 dark:bg-neutral-700 md:h-1.5 md:w-20'
	}
});
