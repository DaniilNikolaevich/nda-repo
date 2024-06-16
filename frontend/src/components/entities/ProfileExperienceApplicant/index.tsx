import { Box, Flex, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';

import { ProfileExperienceApplicantType } from '@/shared/types';

import s from './ProfileExperienceApplicant.module.css';

interface ProfileExperienceApplicantProps {
    experience: Array<ProfileExperienceApplicantType>;
}

export const ProfileExperienceApplicant = ({ experience }: ProfileExperienceApplicantProps) => (
    <Flex direction='column' gap={20}>
        <Flex wrap='nowrap' gap={8} align='center' w='100%'>
            <Title order={4}>Опыт работы</Title>
            <div className={s.divider} />
        </Flex>
        <Flex direction='column' gap={40}>
            {experience?.map(({ company, position, start_date, end_date, duties, achievements }, index) => {
                const date_start = dayjs(start_date);
                const date_end = dayjs(end_date);
                return (
                    <Flex key={index} gap={20}>
                        <Box miw={151} w={151}>
                            <Text>
                                {date_start.format('MMMM')[0].toUpperCase()}
                                {date_start.format('MMMM').slice(1)}&nbsp;{date_start.format('YYYY')}&nbsp;-
                            </Text>
                            {end_date ? (
                                <Text>
                                    {date_end.format('MMMM')[0].toUpperCase()}
                                    {date_end.format('MMMM').slice(1)}&nbsp;{date_end.format('YYYY')}
                                </Text>
                            ) : (
                                <Text>По настоящее время</Text>
                            )}
                        </Box>
                        <Flex direction='column' gap={20}>
                            <Flex direction='column' gap={20}>
                                {company?.name && <Title order={4}>{company.name}</Title>}
                                <Flex direction='column' gap={12}>
                                    <Title order={4}>{position.name}</Title>
                                    <Text>{duties}</Text>
                                </Flex>
                            </Flex>
                            <Flex direction='column' gap={12}>
                                <Title order={4}>Достижения</Title>
                                <Text>{achievements}</Text>
                            </Flex>
                        </Flex>
                    </Flex>
                );
            })}
        </Flex>
    </Flex>
);
