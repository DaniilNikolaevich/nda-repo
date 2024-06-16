import { Flex } from '@mantine/core';

import {
    ProfileAboutApplicant,
    ProfileAvatarApplicant,
    ProfileEducationApplicant,
    ProfileExperienceApplicant,
    ProfileInfoTitle,
    ProfileSalaryApplicant,
} from '@/components/entities';
import {
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
    if (!baseInfo || !experience || !education) {
        return null;
    }

    return (
        <Flex p={20} gap={40} bg='white' direction='column' w='fit-content' style={{ borderRadius: 16 }}>
            <Flex gap={20} mb={20}>
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
