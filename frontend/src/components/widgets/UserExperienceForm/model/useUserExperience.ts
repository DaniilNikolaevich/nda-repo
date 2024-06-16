import { createFormContext } from '@mantine/form';
import { z } from 'zod';

import { UserExperienceSchema } from '@/shared/validate';

type UserExperienceFormProps = z.infer<typeof UserExperienceSchema>;

export const [UserExperienceFormProvider, useUserExperienceFormContext, useUserExperienceForm] =
    createFormContext<UserExperienceFormProps>();
