import { Box, Flex, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';

import { ProfileEducationApplicantType } from '@/shared/types';

import s from './ProfileEducationApplicant.module.css';

interface ProfileEducationApplicantProps {
    education: Array<ProfileEducationApplicantType>;
}

export const ProfileEducationApplicant = ({ education }: ProfileEducationApplicantProps) => (
    <Flex direction='column' gap={20}>
        <Flex wrap='nowrap' gap={8} align='center' w='100%'>
            <Title order={4}>Образование</Title>
            <div className={s.divider} />
        </Flex>
        <Flex direction='column' gap={40}>
            {education?.map(
                ({ faculty, education_level, start_date, end_date, speciality, institution }, index: number) => (
                    <Flex key={index} gap={20}>
                        <Box miw={151} w={151}>
                            <Text>
                                {dayjs(start_date).format('MMMM YYYY')[0].toUpperCase()}
                                {dayjs(start_date).format('MMMM YYYY').slice(1)}&nbsp;-
                            </Text>
                            {end_date ? (
                                <Text>
                                    {dayjs(end_date).format('MMMM')[0].toUpperCase()}
                                    {dayjs(end_date).format('MMMM YYYY').slice(1)}
                                </Text>
                            ) : (
                                <Text>По настоящее время</Text>
                            )}
                        </Box>
                        <Flex direction='column' gap={12}>
                            <Title order={4}>{institution.name}</Title>
                            <Text>{education_level.name}</Text>
                            <Text>{faculty}</Text>
                            <Text>{speciality}</Text>
                        </Flex>
                    </Flex>
                )
            )}
        </Flex>
    </Flex>
);
