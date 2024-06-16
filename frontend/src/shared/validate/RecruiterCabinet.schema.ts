import { z } from 'zod';

export const RecruiterCabinetSchema = z.object({
    name: z.string().nullable(),
    patronymic: z.string().nullable(),
    surname: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().email({ message: 'Неверный email' }).nullable(),
    position: z.string().nullable(),
    department: z.string().nullable(),
});
