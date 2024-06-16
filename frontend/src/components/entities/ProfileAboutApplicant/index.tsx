import { Flex, Text, Title } from '@mantine/core';

import s from '@/components/entities/ProfileEducationApplicant/ProfileEducationApplicant.module.css';

interface ProfileAboutApplicantProps {
    about: string;
}

export const ProfileAboutApplicant = ({ about }: ProfileAboutApplicantProps) => (
    <Flex direction='column' gap={20}>
        <Flex wrap='nowrap' gap={8} align='center' w='100%'>
            <Title order={4}>О себе</Title>
            <div className={s.divider} />
        </Flex>
        <Text>{about}</Text>
    </Flex>
);
