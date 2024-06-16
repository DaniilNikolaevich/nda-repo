import { z } from 'zod';

export const AuthorizationSchema = z.object({
    email: z.string().email({ message: 'Неверный email' }),
    password: z.string(),
});
