import { createFormContext } from '@mantine/form';
import { z } from 'zod';

import { SheduleInterviewSchema } from '@/shared/validate';

type SheduleInterviewFormProps = z.infer<typeof SheduleInterviewSchema>;

export const [SheduleInterviewFormProvider, useSheduleInterviewFormContext, useSheduleInterviewForm] =
    createFormContext<SheduleInterviewFormProps>();
