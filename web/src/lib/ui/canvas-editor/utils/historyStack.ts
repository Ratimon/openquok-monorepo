import { deepEqual } from './deepEqual';

/**
 * Linear undo stack (current index points at the active snapshot).
 * New pushes truncate any redo tail.
 */
export class HistoryStack<T> {
	private stack: T[] = [];
	private index = -1;

	constructor(private readonly maxEntries = 50) {}

	canUndo(): boolean {
		return this.index > 0;
	}

	canRedo(): boolean {
		return this.index < this.stack.length - 1;
	}

	/** Record a new state after a user edit. Skips if identical to the current head. */
	push(state: T, isEqual: (a: T, b: T) => boolean = deepEqual): void {
		if (this.index >= 0 && isEqual(this.stack[this.index] as T, state)) return;
		this.stack = this.stack.slice(0, this.index + 1);
		this.stack.push(state);
		this.index = this.stack.length - 1;
		while (this.stack.length > this.maxEntries) {
			this.stack.shift();
			this.index--;
		}
	}

	peek(): T | undefined {
		return this.index >= 0 ? (this.stack[this.index] as T) : undefined;
	}

	/** Move back and return the snapshot that is now current. */
	undo(): T | null {
		if (!this.canUndo()) return null;
		this.index--;
		return this.stack[this.index] as T;
	}

	/** Move forward and return the snapshot that is now current. */
	redo(): T | null {
		if (!this.canRedo()) return null;
		this.index++;
		return this.stack[this.index] as T;
	}

	clear(initial: T): void {
		this.stack = [initial];
		this.index = 0;
	}
}
