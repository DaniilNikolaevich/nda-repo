import { z } from 'zod';

export const UserContactsSchema = z.object({
    mainContacts: z
        .object({
            contact: z.object({
                is_preferred: z.boolean().nullable(),
                value: z.string().nullable(),
                label: z.string().nullable(),
                type: z.number().nullable(),
                key: z.string(),
            }),
        })
        .array(),
    additionalContacts: z
        .object({
            contact: z.object({
                is_preferred: z.boolean().nullable(),
                value: z.string().nullable(),
                label: z.string().nullable(),
                type: z.number().nullable(),
                key: z.string(),
            }),
        })
        .array(),
});
