import { z } from 'zod';

export const GenerallyDataSchema = z.object({
    name: z.string(),
    middlename: z.string(),
    surname: z.string(),
    sex: z.string(),
    born: z.date().nullable(),
    city: z.string().nullable(),
    skills: z.string().array(),
    about: z.string().nullable(),
    preferred_position: z.string().nullable(),
    preferred_salary: z.any().nullable(),
    preferred_employment_type: z.string().array(),
    preferred_work_schedule: z.string().array(),
    business_trip: z.boolean().nullable(),
    relocation: z.boolean().nullable(),
    country: z.string().nullable(),
});
