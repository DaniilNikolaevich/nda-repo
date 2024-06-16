import { IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { z } from 'zod';

import { MAX_FILE_SIZE } from '@/shared/constants';

export const CreateNewPostSchema = z.object({
    tags: z.array(
        z
            .object({
                id: z.string(),
                name: z.string(),
            })
            .nullable()
    ),
    content: z.string().min(1, 'Введите текст новости'),
    title: z.string().min(1, 'Введите заголовок'),
    documents: z.array(z.string()).nullable(),
    brief_content: z.string(),
});
