import { z } from 'zod';

export const UserEducationSchema = z.object({
    education: z
        .object({
            institution: z.object({
                name: z.string().nullable(),
                value: z.string().nullable(),
                label: z.string().nullable(),
                key: z.string(),
            }),
            start_date: z.object({
                name: z.date().nullable(),
                key: z.string(),
            }),
            end_date: z.object({
                name: z.date().nullable(),
                key: z.string(),
            }),
            faculty: z.object({
                name: z.string().nullable(),
                value: z.string().nullable(),
                label: z.string().nullable(),
                key: z.string(),
            }),
            speciality: z.object({
                name: z.string().nullable(),
                value: z.string().nullable(),
                label: z.string().nullable(),
                key: z.string(),
            }),
            education_level: z.object({
                name: z.string().nullable(),
                value: z.string().nullable(),
                label: z.string().nullable(),
                key: z.string(),
            }),
        })
        .array(),
});
