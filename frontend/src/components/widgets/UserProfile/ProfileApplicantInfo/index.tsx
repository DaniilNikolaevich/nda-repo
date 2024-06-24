import { Flex, useMantineColorScheme } from '@mantine/core';

import {
    ProfileAboutApplicant,
    ProfileAvatarApplicant,
    ProfileEducationApplicant,
    ProfileExperienceApplicant,
    ProfileInfoTitle,
    ProfileSalaryApplicant,
} from '@/components/entities';
import { useIsTablet } from '@/shared/hooks/media';
import type {
    ProfileEducationApplicantType,
    ProfileExperienceApplicantType,
    ProfileInfoApplicantTypes,
} from '@/shared/types';

interface ProfileApplicantInfoProps {
    baseInfo?: ProfileInfoApplicantTypes;
    experience?: Array<ProfileExperienceApplicantType>;
    education?: Array<ProfileEducationApplicantType>;
}

export const ProfileApplicantInfo = ({ baseInfo, experience, education }: ProfileApplicantInfoProps) => {
    const isTablet = useIsTablet();
    const { colorScheme } = useMantineColorScheme();
    const isDarkTheme = colorScheme === 'dark';

    if (!baseInfo || !experience || !education) {
        return null;
    }

    return (
        <Flex
            p={20}
            gap={40}
            bg={isDarkTheme ? 'dark.4' : 'white'}
            direction='column'
            w='fit-content'
            style={{ borderRadius: 16 }}
        >
            <Flex gap={20} mb={20} align='flex-start' direction={isTablet ? 'row' : 'column'}>
                <ProfileAvatarApplicant avatar={baseInfo?.avatar_url} />
                <ProfileInfoTitle data={baseInfo} />
            </Flex>
            <ProfileSalaryApplicant baseInfo={baseInfo} />
            <ProfileExperienceApplicant experience={experience} />
            <ProfileAboutApplicant about={baseInfo?.about} />
            <ProfileEducationApplicant education={education} />
        </Flex>
    );
};
