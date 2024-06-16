import { Flex, Text, Title } from '@mantine/core';

import { ProfileInfoApplicantTypes } from '@/shared/types';

interface ProfileSalaryApplicantProps {
    baseInfo: ProfileInfoApplicantTypes;
}

export const ProfileSalaryApplicant = ({ baseInfo }: ProfileSalaryApplicantProps) => (
    <Flex direction='column' gap={20}>
        <Flex justify='space-between' gap={40}>
            <Title order={3}>{baseInfo?.preferred_position?.name}</Title>
            {baseInfo?.preferred_salary ? (
                <Title order={3}>{baseInfo?.preferred_salary}&nbsp;₽</Title>
            ) : (
                <Title order={3}>Зарплата&nbsp;не&nbsp;указана</Title>
            )}
        </Flex>
        <Flex>
            <Text>
                {baseInfo?.preferred_work_schedule.map(({ name }, index) => (
                    <>{index === 0 ? name : name.toLowerCase()},&nbsp;</>
                ))}
            </Text>
            <Text>
                {baseInfo?.preferred_employment_type.map(({ name }, index) => <>{name.toLowerCase()},&nbsp;</>)}
            </Text>
        </Flex>
    </Flex>
);
