import { Button, Flex, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

import { useGetCommentsAboutUserQuery, useSendCommentAboutCandidateMutation } from '@/services';
import { ProfileInfoApplicantTypes } from '@/shared/types';

import { Form } from './ui';

interface ProfileCommentsByCandidateProps {
    baseInfoById: ProfileInfoApplicantTypes;
}

export const ProfileCommentsByCandidate = ({ baseInfoById }: ProfileCommentsByCandidateProps) => {
    const {
        query: { id },
    } = useRouter();
    const [opened, { open, close }] = useDisclosure(false);

    const { data: comments } = useGetCommentsAboutUserQuery((id as string) ?? '', {
        skip: !id,
        refetchOnMountOrArgChange: true,
    });
    const prepareComments = comments?.payload.slice(0, 3) ?? [];

    return (
        <Flex
            p={20}
            gap={20}
            bg='#EDF2FF'
            maw={310}
            miw={310}
            h='fit-content'
            direction='column'
            style={{ borderRadius: 16 }}
        >
            <Flex align='center' gap={8}>
                <PencilSimple size={16} />
                <Title order={5}>Комментарии рекрутера</Title>
            </Flex>
            <Flex direction='column' gap={20}>
                {prepareComments.length > 0 ? (
                    prepareComments.map(({ id, author, text, created_at }) => (
                        <Flex key={id} direction='column' gap={4}>
                            <Flex justify='space-between' wrap='wrap'>
                                <Text size='xs' c='dimmed'>
                                    {author.surname}&nbsp;{author.name}
                                </Text>
                                <Text size='xs' c='dimmed'>
                                    {dayjs(created_at).format('DD.MM.YYYY HH:mm')}
                                </Text>
                            </Flex>
                            <Flex>
                                <Text style={{ fontSize: 14 }}>{text}</Text>
                            </Flex>
                        </Flex>
                    ))
                ) : (
                    <Flex>Комментариев нет</Flex>
                )}
            </Flex>
            <Flex justify='center'>
                <Text fw={600} style={{ fontSize: 14, color: '#4263EB', cursor: 'pointer' }} onClick={open}>
                    Посмотреть и добавить комментарий
                </Text>
            </Flex>
            <Form opened={opened} close={close} />
        </Flex>
    );
};
