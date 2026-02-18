import { z } from 'zod';

export const fileSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  name: z.string().min(1, 'File name is required'),
  size: z.string().optional(),
  date: z.string().optional(),
  category: z.string().optional(),
  iconType: z.string().default('pdf'),
  color: z.string().default('text-red-500'),
});

export type FileFormData = z.infer<typeof fileSchema>;
