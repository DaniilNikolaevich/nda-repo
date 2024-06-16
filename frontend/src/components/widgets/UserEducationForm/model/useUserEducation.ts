import { createFormContext } from '@mantine/form';
import { z } from 'zod';

import { UserEducationSchema } from '@/shared/validate';

type UserEducationFormProps = z.infer<typeof UserEducationSchema>;

export const [UserEducationFormProvider, useUserEducationFormContext, useUserEducationForm] =
    createFormContext<UserEducationFormProps>();
