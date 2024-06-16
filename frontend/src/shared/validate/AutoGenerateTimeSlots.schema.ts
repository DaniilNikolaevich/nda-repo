import { z } from 'zod';

export const AutoGenerateTimeSlotsSchema = z.object({
    start_date: z.object({
        name: z.string().nullable(),
        key: z.string(),
    }),
    end_date: z.object({
        name: z.string().nullable(),
        key: z.string(),
    }),
    session_duration: z.object({
        name: z.string().nullable(),
        key: z.string(),
    }),
    gap_duration: z.object({
        name: z.string().nullable(),
        key: z.string(),
    }),
});
