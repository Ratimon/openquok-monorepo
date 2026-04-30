import { z } from 'zod';

export const feedbackDescriptionSchema = z
	.string()
	.min(10, { message: 'Description must be at least 10 characters long.' })
	.trim();
