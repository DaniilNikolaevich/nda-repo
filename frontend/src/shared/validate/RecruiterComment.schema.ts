import { IMAGE_MIME_TYPE, MS_WORD_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import { z } from 'zod';

import { MAX_FILE_SIZE } from '@/shared/constants';

export const RecruiterCommentSchema = z.object({
    text: z.string().min(1, 'Неверный email'),
    file: z
        .custom<Blob>()
        .refine((blob) => blob.size <= MAX_FILE_SIZE.resume, {
            message: 'Максимальный размер файла 1 Мб',
        })
        .refine(
            (blob) => ([...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE, ...MS_WORD_MIME_TYPE] as string[]).includes(blob?.type),
            {
                message: 'Допустимые форматы файла .pdf, .doc, .docx, .png, .jpeg, .jpg',
            }
        )
        .nullable(),
});
