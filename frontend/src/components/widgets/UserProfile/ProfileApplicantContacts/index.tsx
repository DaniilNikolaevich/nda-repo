import { useEffect } from 'react';
import { Button, Flex, Menu, Text, Title, useMantineColorScheme } from '@mantine/core';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { ChatDots } from '@phosphor-icons/react/dist/ssr/ChatDots';
import { isArray } from 'lodash-es';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { InviteApplicantForVacancy } from '@/components/features';
import { useGetChatByCandidateQuery } from '@/services';
import { useCreateChatWithCandidate, useSelectCandidateForJob } from '@/services/RecruiterService/hooks';
import { useGetAllVacanciesForRecruiterQuery } from '@/services/VacanciesService';
import type { ProfileInfoApplicantTypes } from '@/shared/types';
import { contactsMapper, getLinkExternalType } from '@/shared/utils';

export const ProfileApplicantContacts = ({ data }: { data?: ProfileInfoApplicantTypes }) => {
    const {
        push,
        query: { id },
    } = useRouter();
    const { handleSelectCandidate } = useSelectCandidateForJob();

    const { colorScheme } = useMantineColorScheme();
    const isDarkTheme = colorScheme === 'dark';

    const { data: vacancies } = useGetAllVacanciesForRecruiterQuery(
        {
            status__in: 1,
        },
        {
            skip: !id,
            refetchOnMountOrArgChange: true,
        }
    );
    const { data: chatsByCandidate } = useGetChatByCandidateQuery(
        {
            candidate_id: (id as string) ?? '',
        },
        {
            skip: !id,
            refetchOnMountOrArgChange: true,
        }
    );

    const { handleCreateChat, chatInfo } = useCreateChatWithCandidate();
    const handleSelectChat = (chatId: string | number) => {
        push(`/chats?chatId=${chatId}`);
    };

    useEffect(() => {
        if (chatInfo) {
            push(`/chats?chatId=${chatInfo.chat_id}`);
        }
    }, [chatInfo]);

    return (
        <Flex
            p={20}
            gap={24}
            bg={isDarkTheme ? 'dark.4' : 'white'}
            miw={310}
            h='fit-content'
            direction='column'
            style={{ borderRadius: 16 }}
        >
            <Flex direction='column' gap={12}>
                <Flex justify='space-between' align='center'>
                    <Title order={5}>Контакты</Title>
                    {id && (
                        <Flex align='center' gap={8}>
                            {chatsByCandidate?.chats && chatsByCandidate?.chats?.length > 0 ? (
                                <Menu shadow='md' width={270}>
                                    <Menu.Target>
                                        <Button variant='light'>
                                            <Flex gap={8} align='center'>
                                                В чат <CaretDown weight='bold' size={16} />
                                            </Flex>
                                        </Button>
                                    </Menu.Target>

                                    <Menu.Dropdown>
                                        {chatsByCandidate.chats?.map(({ id, name }) => (
                                            <Menu.Item key={id} onClick={() => handleSelectChat(id)}>
                                                {name}
                                            </Menu.Item>
                                        ))}
                                    </Menu.Dropdown>
                                </Menu>
                            ) : (
                                <Button
                                    variant='light'
                                    onClick={() => {
                                        if (!id || isArray(id)) return;
                                        handleCreateChat(id);
                                    }}
                                >
                                    <Flex align='center' justify='center' gap={8}>
                                        <ChatDots size={20} />В чат
                                    </Flex>
                                </Button>
                            )}
                        </Flex>
                    )}
                </Flex>
                {data?.contacts ? (
                    <Flex miw={270} gap={12} direction='column'>
                        {isArray(data?.contacts) &&
                            data?.contacts?.map(
                                ({ value, type, is_preferred }, index) =>
                                    value && (
                                        <Flex key={index} direction='column'>
                                            <Flex>
                                                <Text fz={14}>{contactsMapper(type)}:&nbsp;</Text>
                                                <Link
                                                    target='_blank'
                                                    href={`${getLinkExternalType(type)}${contactsMapper(type) === 'Telegram' ? value.replace('@', '') : value}`}
                                                >
                                                    <Text c='indigo.8' fz={14}>
                                                        {value}
                                                    </Text>
                                                </Link>
                                                <Text fz={14}>{is_preferred && <>&nbsp;–&nbsp;</>}</Text>
                                            </Flex>
                                            {is_preferred && <Text fz={14}>предпочитаемый способ связи</Text>}
                                        </Flex>
                                    )
                            )}
                    </Flex>
                ) : (
                    <Text>Контактов еще нет</Text>
                )}
            </Flex>
            {id && !isArray(id) && vacancies && (
                <InviteApplicantForVacancy
                    vacancies={vacancies?.payload}
                    candidate_id={id}
                    onSelect={handleSelectCandidate}
                />
            )}
        </Flex>
    );
};
