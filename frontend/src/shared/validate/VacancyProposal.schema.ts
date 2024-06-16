import { z } from 'zod';

import { ACCEPTED_FILE_TYPE, MAX_FILE_SIZE } from '@/shared/constants';

export const VacancyProposal = z.object({
    snp: z.string(),
    email: z.string().email({ message: 'Неверный email' }),
    cv_file: z
        .custom<Blob>()
        .refine((blob) => blob.size <= MAX_FILE_SIZE.resume, {
            message: 'Максимальный размер файла 1 Мб',
        })
        .refine((blob) => ACCEPTED_FILE_TYPE.resume.mediaTypes.includes(blob?.type), {
            message: 'Допустимые форматы файла .pdf',
        })
        .nullable(),
});
