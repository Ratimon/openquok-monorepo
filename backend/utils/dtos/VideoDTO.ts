export type VideoDto = {
    organizationId: string;
    type: string;
    output: string;
    customParams?: unknown;
};

export type VideoFunctionDto = {
    identifier: string;
    functionName: string;
    params?: unknown;
};

