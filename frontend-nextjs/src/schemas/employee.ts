import { z } from 'zod';

export const employeeSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  image: z.string().min(1, 'Image is required'),
  name: z.string().min(1, 'Name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  alt: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  status: z.enum(['Online', 'Offline', 'Busy', 'In Meeting']),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
