import { z } from 'zod';

export const AddNewRecruiterSchema = z.object({
    name: z.string(),
    patronymic: z.string(),
    surname: z.string(),
    email: z.string().email({ message: 'Неверный email' }),
});
