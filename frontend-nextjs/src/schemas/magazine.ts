import { z } from 'zod';

export const magazineSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  title: z.string().min(1, 'Title is required'),
  cover: z.string().min(1, 'Cover is required'),
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
});

export type MagazineFormData = z.infer<typeof magazineSchema>;
