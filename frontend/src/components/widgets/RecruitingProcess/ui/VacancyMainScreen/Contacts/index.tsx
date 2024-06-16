import { Fragment } from 'react';
import { Box, Flex, Group, Spoiler, Stack, Text } from '@mantine/core';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { isArray } from 'lodash-es';
import Link from 'next/link';

import { CandidateModel } from '@/shared/types/common-models/Candidates';
import { contactsMapper } from '@/shared/utils';

export const Contacts = ({ contacts }: { contacts?: CandidateModel['contacts'] }) => {
    if (!isArray(contacts)) return null;

    return (
        <Stack gap='var(--size-sm)'>
            <Flex wrap='wrap' gap='var(--size-sm)' maw={216}>
                {contacts?.map((contact) => {
                    if (contact.value.length < 1) return;
                    switch (contactsMapper(contact.type)) {
                        case 'Телефон':
                            return (
                                <Flex gap={12} key={contact.value}>
                                    <Text fz={14} c='dimmed' w={64}>
                                        Телефон
                                    </Text>
                                    <Text
                                        lineClamp={1}
                                        maw={190}
                                        span
                                        style={{ textOverflow: 'ellipsis' }}
                                        fz={14}
                                        fw={600}
                                    >
                                        <Link href={`tel:${contact.value}`}>{contact.value}</Link>
                                    </Text>
                                </Flex>
                            );
                        case 'Email':
                            return (
                                <Flex gap={12} key={contact.value}>
                                    <Text fz={14} c='dimmed' w={64}>
                                        Email
                                    </Text>
                                    <Text
                                        lineClamp={1}
                                        maw={190}
                                        span
                                        style={{ textOverflow: 'ellipsis' }}
                                        fz={14}
                                        fw={600}
                                    >
                                        <Link href={`mailto:${contact.value}`}>{contact.value}</Link>
                                    </Text>
                                </Flex>
                            );
                        case 'Telegram':
                            return (
                                <Flex gap={12} key={contact.value}>
                                    <Text fz={14} c='dimmed' w={64}>
                                        Telegram
                                    </Text>
                                    <Text
                                        lineClamp={1}
                                        maw={190}
                                        span
                                        style={{ textOverflow: 'ellipsis' }}
                                        fz={14}
                                        fw={600}
                                    >
                                        <Link href={`mailto:${contact.value}`}>{contact.value}</Link>
                                    </Text>
                                </Flex>
                            );
                        default:
                            return;
                    }
                })}
            </Flex>
            <Spoiler
                mb={40}
                maxHeight={0}
                hideLabel='Скрыть все контакты'
                showLabel={
                    <Flex c='indigo.8' fw={600} gap='var(--size-sm)' align='center'>
                        Показать все контакты <CaretDown size={20} />
                    </Flex>
                }
            >
                <Group mb={20} gap='var(--size-sm)' maw={216}>
                    {contacts?.map((contact) => {
                        if (contact.value.length < 1) return;
                        switch (contactsMapper(contact.type)) {
                            case 'Телефон':
                                return null;
                            case 'Email':
                                return null;
                            case 'Telegram':
                                return null;
                            default:
                                return (
                                    <Flex gap={12} key={contact.value}>
                                        <Text fz={14} c='dimmed' w={64}>
                                            {contactsMapper(contact.type)}
                                        </Text>
                                        <Text
                                            lineClamp={1}
                                            maw={190}
                                            span
                                            style={{ textOverflow: 'ellipsis' }}
                                            fz={14}
                                            fw={600}
                                        >
                                            <Link href={contact.value}>{contact.value}</Link>
                                        </Text>
                                    </Flex>
                                );
                        }
                    })}
                </Group>
            </Spoiler>
        </Stack>
    );
};
