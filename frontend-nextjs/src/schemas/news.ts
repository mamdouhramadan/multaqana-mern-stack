import { z } from 'zod';

export const newsSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  image: z.string().min(1, 'Image is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  url: z.string().min(1, 'URL is required'),
});

export type NewsFormData = z.infer<typeof newsSchema>;
