import { z } from 'zod';

export const UserExperienceSchema = z.object({
    experience: z
        .object({
            company: z.object({
                name: z.string().nullable(),
                value: z.string().nullable(),
                label: z.string().nullable(),
                key: z.string(),
            }),
            position: z.object({
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
            duties: z.object({
                name: z.string().nullable(),
                value: z.string().nullable(),
                label: z.string().nullable(),
                key: z.string(),
            }),
            achievements: z.object({
                name: z.string().nullable(),
                value: z.string().nullable(),
                label: z.string().nullable(),
                key: z.string(),
            }),
        })
        .array(),
});
