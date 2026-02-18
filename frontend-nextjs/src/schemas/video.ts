import { z } from 'zod';

export const videoSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  title: z.string().min(1, 'Title is required'),
  thumbnail: z.string().optional(),
  duration: z.string().optional(),
  views: z.string().default('0'),
  videoUrl: z.string().min(1, 'Video URL is required'),
});

export type VideoFormData = z.infer<typeof videoSchema>;
