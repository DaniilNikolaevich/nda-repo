import { createFormContext } from '@mantine/form';
import { z } from 'zod';

import { CreateNewPostSchema } from '@/shared/validate/CreateNewPost.schema';

export type CreateNewPostFormProps = z.infer<typeof CreateNewPostSchema>;

export const [CreateNewPostFormProvider, usCreateNewPostContext, useCreateNewPostForm] =
    createFormContext<CreateNewPostFormProps>();
