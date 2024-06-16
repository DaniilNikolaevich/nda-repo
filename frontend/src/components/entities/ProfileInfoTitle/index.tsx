import { Chip, Flex, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';

import type { ProfileInfoApplicantTypes } from '@/shared/types';
import { getAgeString, readyToBusinessTrip, readyToMove } from '@/shared/utils';

import s from './ProfileInfoTitle.module.css';

interface ProfileAvatarTitleProps {
    data: ProfileInfoApplicantTypes;
}

export const ProfileInfoTitle = ({ data }: ProfileAvatarTitleProps) => {
    const age = data?.birth_date ? Number(dayjs().diff(dayjs(data?.birth_date ?? ''), 'year')) : 0;

    return (
        <Flex direction='column' gap={16}>
            <Flex direction='column' gap={8}>
                <Title order={3}>{data?.user?.fullname ?? ''}</Title>
                <Text c='dimmed'>
                    {data?.sex?.name}
                    {data?.birth_date && <>,</>}&nbsp;
                    {data?.birth_date && (
                        <>
                            {age}&nbsp;{getAgeString(age)},&nbsp; родился&nbsp;
                            <time>{dayjs(data?.birth_date ?? '').format('DD MMMM YYYY')}</time>
                        </>
                    )}
                </Text>
            </Flex>
            <Text>
                {data?.country?.name},&nbsp;
                {data?.city?.name},&nbsp;
                {readyToBusinessTrip(data?.business_trip)},&nbsp;
                {readyToMove(data?.relocation)}
            </Text>
            {data?.skills && data?.skills?.length > 0 && (
                <Flex gap={12} wrap='wrap'>
                    {data?.skills.map(({ name }, index) => (
                        <Chip key={index} className={s.chip} disabled>
                            {name}
                        </Chip>
                    ))}
                </Flex>
            )}
        </Flex>
    );
};
