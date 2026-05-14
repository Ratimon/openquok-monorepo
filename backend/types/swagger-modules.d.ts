declare module "swagger-jsdoc" {
	function swaggerJsdoc(options: {
		definition: Record<string, unknown>;
		apis: string[];
	}): Record<string, unknown>;
	export default swaggerJsdoc;
}

declare module "swagger-ui-express" {
	import type { RequestHandler } from "express";

	export const serve: RequestHandler[];
	export function setup(
		swaggerDoc: Record<string, unknown>,
		opts?: {
			explorer?: boolean;
			customCss?: string;
			customSiteTitle?: string;
			swaggerOptions?: Record<string, unknown>;
		}
	): RequestHandler;
}
