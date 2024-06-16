import { z } from 'zod';

export const RestorePasswordSchema = z
    .object({
        password: z.string().min(8, 'Пароль должен содержать не менее 8 символов'),
        password_confirm: z.string().min(8, 'Пароль должен содержать не менее 8 символов'),
    })
    .superRefine(({ password_confirm, password }, ctx) => {
        if (password_confirm !== password) {
            ctx.addIssue({
                code: 'custom',
                message: 'Пароли должны совпадать',
                path: ['password_confirm'],
            });
        }
    });
