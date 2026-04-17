declare module "@aws-sdk/s3-request-presigner" {
    // Minimal local type shim to keep TS happy before dependencies are installed.
    // When `@aws-sdk/s3-request-presigner` is present in node_modules, its real types will apply.
    export function getSignedUrl(client: unknown, command: unknown, options?: unknown): Promise<string>;
}

