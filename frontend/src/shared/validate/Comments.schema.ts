import { z } from 'zod';

export const CommentsSchema = z.object({
    content: z.string().min(1, 'Введите текст комментария'),
});
