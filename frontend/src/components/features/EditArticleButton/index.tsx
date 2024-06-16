import { ActionIcon } from '@mantine/core';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import Link from 'next/link';

export const EditArticleButton = ({ id }: { id: string }) => (
    <ActionIcon component={Link} href={`/recruiter/article/edit/${id}`} variant='outline' size='lg'>
        <PencilSimple weight='bold' />
    </ActionIcon>
);
