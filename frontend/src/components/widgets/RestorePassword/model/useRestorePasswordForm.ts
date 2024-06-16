import { createFormContext } from '@mantine/form';
import { z } from 'zod';

import { RestorePasswordSchema } from '@/shared/validate';

type RestorePasswordProps = z.infer<typeof RestorePasswordSchema>;

export const [RestorePasswordFormProvider, useRestorePasswordFormContext, useRestorePasswordForm] =
    createFormContext<RestorePasswordProps>();
