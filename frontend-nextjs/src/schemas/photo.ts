import { z } from 'zod';

export const photoSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  src: z.string().min(1, 'Image is required'),
  alt: z.string().min(1, 'Alt text is required'),
  height: z.string().default('h-64'),
});

export type PhotoFormData = z.infer<typeof photoSchema>;
