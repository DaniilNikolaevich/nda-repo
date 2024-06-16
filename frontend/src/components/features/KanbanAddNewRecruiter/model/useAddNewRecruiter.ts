import { createFormContext } from '@mantine/form';
import { z } from 'zod';

import { AddNewRecruiterSchema } from '@/shared/validate';

type AddNewRecruiterFormProps = z.infer<typeof AddNewRecruiterSchema>;

export const [AddNewRecruiterProvider, useAddNewRecruiterFormContext, useAddNewRecruiterForm] =
    createFormContext<AddNewRecruiterFormProps>();
