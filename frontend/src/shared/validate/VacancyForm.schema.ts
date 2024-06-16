import { z } from 'zod';

export const VacancyFormSchema = z.object({
    name: z.string(),
    patronymic: z.string(),
    surname: z.string(),
    email: z.string().email({ message: 'Неверный email' }).nullable(),
    phone: z.string(),
    recruiter_position: z.string(),

    position: z.string(),
    department: z.string().nullable(),
    country: z.string().nullable(),
    city: z.string().nullable(),
    preferred_salary: z.any().nullable(),
    category: z.string().nullable(),
    employment_type: z.string(),
    work_schedule: z.string(),
    description: z.string().nullable(),
    tasks: z.string(),
    skills: z.string().array(),
    additional_requirements: z.string().nullable(),
    benefits: z.string(),
});
