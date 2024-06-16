import { Button } from '@mantine/core';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import Link from 'next/link';

export const AddNewArticleButton = () => (
    <Button component={Link} href='/recruiter/article/new' leftSection={<Plus size={20} />}>
        Добавить новость
    </Button>
);
