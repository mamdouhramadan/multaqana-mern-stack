import { z } from 'zod';

export const faqSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().min(1, 'Category is required'),
});

export type FAQFormData = z.infer<typeof faqSchema>;
