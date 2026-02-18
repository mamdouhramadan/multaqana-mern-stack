import { z } from 'zod';

export const applicationSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  name: z.string().min(1, 'Name is required'),
  href: z.string().url('Please enter a valid URL'),
  image: z.string().min(1, 'Image path is required'),
  category: z.string().min(1, 'Category is required'),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
