import { createFormContext } from '@mantine/form';
import { z } from 'zod';

import { UserContactsSchema } from '@/shared/validate';

type UserContactsFormProps = z.infer<typeof UserContactsSchema>;

export const [UserContactsFormProvider, useUserContactsFormContext, useUserContactsForm] =
    createFormContext<UserContactsFormProps>();
