import { memo } from 'react';
import { Title } from '@mantine/core';

interface FormCategoryNameTypes {
    title: string;
}

export const FormCategoryName = memo(({ title }: FormCategoryNameTypes) => (
    <Title mb='var(--size-lg)' order={4}>
        {title}
    </Title>
));

FormCategoryName.displayName = 'GenerallyDataFormCategoryName';
