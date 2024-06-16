import { ReactNode } from 'react';
import { Avatar, Button, Flex, NumberFormatter, Paper, Stack, Text, Title } from '@mantine/core';
import { ChatDots } from '@phosphor-icons/react/dist/ssr/ChatDots';
import { Sparkle } from '@phosphor-icons/react/dist/ssr/Sparkle';
import { isArray } from 'lodash-es';
import Link from 'next/link';

import { CandidateModel } from '@/shared/types/common-models/Candidates';
import { contactsMapper } from '@/shared/utils';

import s from './CandidateProfileCard.module.css';

interface CandidateProfileCardProps extends CandidateModel {
    actionSlot?: ReactNode;
}

export const CandidateProfileCard = ({
    avatar_thumbnail_url,
    user,
    city,
    contacts,
    preferred_position,
    preferred_salary,
    ai_summary,
    actionSlot,
}: CandidateProfileCardProps) => (
    <Paper withBorder p='var(--size-lg)' component={Link} href={`/profiles/${user.id}`} c='black' className={s.root}>
        <Stack>
            <Flex gap='var(--size-sm)'>
                <Avatar src={avatar_thumbnail_url ?? ''} radius='md' w={120} h={120} />
                <Stack gap='var(--size-xxs)'>
                    <Title fz={24} order={5}>
                        {user.fullname}
                    </Title>
                    <Text fz={14}>{city?.name ?? ''}</Text>
                    {isArray(contacts) &&
                        contacts
                            ?.filter(
                                (contact) =>
                                    contactsMapper(contact.type) === 'Телефон' ||
                                    contactsMapper(contact.type) === 'Email'
                            )
                            .map((contact) => (
                                <Text fz={14} key={contact.value}>
                                    {contactsMapper(contact.type)}:{' '}
                                    <Link
                                        href={`${contactsMapper(contact.type) === 'Телефон' ? 'tel' : 'mailto'}:${contact.value}`}
                                    >
                                        {contact.value}
                                    </Link>
                                </Text>
                            ))}
                </Stack>
            </Flex>
            <Flex justify='space-between'>
                <Title order={6} fz={18}>
                    {preferred_position?.name}
                </Title>
                <Text fw={600} fz={18}>
                    <NumberFormatter thousandSeparator=' ' value={preferred_salary} suffix=' ₽' />
                </Text>
            </Flex>
            {ai_summary && (
                <Paper bg='gray.0' py='var(--size-sm)' px='var(--size-md)'>
                    <Stack gap='var(--size-xxs)'>
                        <Flex align='center' gap='var(--size-xs)'>
                            <Sparkle />
                            <Text fz={16} fw={600}>
                                Саммари резюме соискателя
                            </Text>
                        </Flex>
                        <Text lineClamp={3}>{ai_summary}</Text>
                    </Stack>
                </Paper>
            )}
            <Flex gap='var(--size-sm)'>{actionSlot}</Flex>
        </Stack>
    </Paper>
);
