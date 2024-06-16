import { createFormContext, useField } from '@mantine/form';
import { z } from 'zod';

import { GenerallyDataSchema } from '@/shared/validate';

type GenerallyDataFormProps = z.infer<typeof GenerallyDataSchema>;

export const [GenerallyDataFormProvider, useGenerallyDataFormContext, useGenerallyDataForm] =
    createFormContext<GenerallyDataFormProps>();
