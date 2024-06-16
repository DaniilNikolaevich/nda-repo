import { createFormContext } from '@mantine/form';
import { z } from 'zod';

import { VacancyFormSchema } from '@/shared/validate';

type VacancyFormProps = z.infer<typeof VacancyFormSchema>;

export const [VacancyFormProvider, useVacancyFormContext, useVacancyForm] = createFormContext<VacancyFormProps>();
