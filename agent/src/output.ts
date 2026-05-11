export function printJson(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

export function printErrorJson(err: unknown): void {
  if (err instanceof Error) {
    const anyErr = err as any;
    printJson({
      success: false,
      error: {
        name: err.name,
        message: err.message,
        ...(typeof anyErr.operation === "string" ? { operation: anyErr.operation } : {}),
        ...(typeof anyErr.status === "number" ? { status: anyErr.status } : {}),
        ...(anyErr.body !== undefined ? { body: anyErr.body } : {}),
      },
    });
    return;
  }
  printJson({ success: false, error: err });
}

