import { createFormContext } from '@mantine/form';
import { z } from 'zod';

import { RecruiterCabinetSchema } from '@/shared/validate';

type RecruiterCabinetFormProps = z.infer<typeof RecruiterCabinetSchema>;

export const [RecruiterCabinetFormProvider, useRecruiterCabinetFormContext, useRecruiterCabinetForm] =
    createFormContext<RecruiterCabinetFormProps>();
