import { z } from 'zod';

export const SheduleInterviewSchema = z.object({
    monday: z
        .object({
            start_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            end_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            numOfDay: z.number(),
            disabled: z.boolean(),
        })
        .array(),
    tuesday: z
        .object({
            start_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            end_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            numOfDay: z.number(),
            disabled: z.boolean(),
        })
        .array(),
    wednesday: z
        .object({
            start_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            end_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            numOfDay: z.number(),
            disabled: z.boolean(),
        })
        .array(),
    thursday: z
        .object({
            start_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            end_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            numOfDay: z.number(),
            disabled: z.boolean(),
        })
        .array(),
    friday: z
        .object({
            start_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            end_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            numOfDay: z.number(),
            disabled: z.boolean(),
        })
        .array(),
    saturday: z
        .object({
            start_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            end_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            numOfDay: z.number(),
            disabled: z.boolean(),
        })
        .array(),
    sunday: z
        .object({
            start_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            end_date: z.object({
                name: z.string().nullable(),
                key: z.string(),
            }),
            numOfDay: z.number(),
            disabled: z.boolean(),
        })
        .array(),
});
