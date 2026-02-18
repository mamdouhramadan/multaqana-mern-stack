import { z } from 'zod';

export const eventSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  title: z.string().min(1, 'Title is required'),
  start: z.string().min(1, 'Start date is required'),
  end: z.string().min(1, 'End date is required'),
  allDay: z.boolean().default(false),
  resource: z.string().optional(),
  cover_image: z.string().optional(),
  details: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
