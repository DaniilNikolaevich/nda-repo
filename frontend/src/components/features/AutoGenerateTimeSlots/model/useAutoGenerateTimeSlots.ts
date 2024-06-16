import { createFormContext } from '@mantine/form';
import { z } from 'zod';

import { AutoGenerateTimeSlotsSchema } from '@/shared/validate';

type AutoGenerateTimeSlotsFormProps = z.infer<typeof AutoGenerateTimeSlotsSchema>;

export const [AutoGenerateTimeSlotsFormProvider, useAutoGenerateTimeSlotsFormContext, useAutoGenerateTimeSlotsForm] =
    createFormContext<AutoGenerateTimeSlotsFormProps>();
