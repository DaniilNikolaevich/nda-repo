import { Fragment } from 'react';
import { Flex, NumberFormatter, Text, Title } from '@mantine/core';

import type { ProfileInfoApplicantTypes } from '@/shared/types';

interface ProfileSalaryApplicantProps {
    baseInfo: ProfileInfoApplicantTypes;
}

export const ProfileSalaryApplicant = ({ baseInfo }: ProfileSalaryApplicantProps) => (
    <Flex direction='column' gap={20}>
        <Flex justify='space-between' gap={40}>
            <Title order={3}>{baseInfo?.preferred_position?.name}</Title>
            {baseInfo?.preferred_salary ? (
                <Title order={3}>
                    <NumberFormatter thousandSeparator=' ' value={baseInfo?.preferred_salary} suffix=' ₽' />
                </Title>
            ) : (
                <Title order={3}>Зарплата&nbsp;не&nbsp;указана</Title>
            )}
        </Flex>
        <Flex>
            <Text>
                {baseInfo?.preferred_work_schedule.map(({ name, id }, index) => (
                    <Fragment key={id}>{index === 0 ? name : name.toLowerCase()},&nbsp;</Fragment>
                ))}
            </Text>
            <Text>
                {baseInfo?.preferred_employment_type.map(({ name, id }, index) => (
                    <Fragment key={id}>{name.toLowerCase()},&nbsp;</Fragment>
                ))}
            </Text>
        </Flex>
    </Flex>
);
