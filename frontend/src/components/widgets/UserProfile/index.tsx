import { Flex, Loader } from '@mantine/core';
import { useUnit } from 'effector-react';
import { isNull } from 'lodash-es';
import { useRouter } from 'next/router';

import { ProfileCommentsByCandidate, ProfileSummaryByCandidate } from '@/components/features';
import {
    $isAuth,
    $isRecruiter,
    useGetAllWorkExperienceByMeQuery,
    useGetAllWorkExperienceByUserQuery,
    useGetEducationByMeQuery,
    useGetEducationByUserQuery,
    useGetMainInfoByMeQuery,
    useGetMainInfoByUserQuery,
} from '@/services';
import { useIsTablet } from '@/shared/hooks/media';

import { ProfileApplicantContacts } from './ProfileApplicantContacts';
import { ProfileApplicantInfo } from './ProfileApplicantInfo';

export const UserProfile = () => {
    const isAuth = useUnit($isAuth);
    const isRecruiter = useUnit($isRecruiter);
    const isTablet = useIsTablet();
    const {
        query: { id },
    } = useRouter();

    const { data: baseInfo, isFetching: isFetchingBaseInfo } = useGetMainInfoByMeQuery(null, {
        skip: Boolean(id) || !isAuth || Boolean(isRecruiter),
        refetchOnMountOrArgChange: true,
    });
    const { data: experience, isFetching: isFetchingExperience } = useGetAllWorkExperienceByMeQuery(null, {
        skip: Boolean(id),
        refetchOnMountOrArgChange: true,
    });
    const { data: education, isFetching: isFetchingEducation } = useGetEducationByMeQuery(null, {
        skip: Boolean(id),
        refetchOnMountOrArgChange: true,
    });

    const { data: baseInfoById, isFetching: isFetchingBaseInfoById } = useGetMainInfoByUserQuery(
        {
            userId: (id as string) ?? '',
        },
        {
            skip: !id,
            refetchOnMountOrArgChange: true,
        }
    );
    const { data: experienceById, isFetching: isFetchingExperienceById } = useGetAllWorkExperienceByUserQuery(
        {
            userId: (id as string) ?? '',
        },
        {
            skip: !id,
            refetchOnMountOrArgChange: true,
        }
    );
    const { data: educationById, isFetching: isFetchingEducationById } = useGetEducationByUserQuery(
        {
            userId: (id as string) ?? '',
        },
        {
            skip: !id,
            refetchOnMountOrArgChange: true,
        }
    );

    const isFetching =
        isFetchingBaseInfo ||
        isFetchingExperience ||
        isFetchingEducation ||
        isFetchingBaseInfoById ||
        isFetchingExperienceById ||
        isFetchingEducationById;

    if (isFetching) {
        return (
            <Flex align='center' justify='center'>
                <Loader />
            </Flex>
        );
    }

    return (
        <Flex direction={isTablet ? 'row-reverse' : 'column'} gap='var(--size-lg)' justify='center' pos='relative'>
            <Flex direction='column' gap='var(--size-lg)' pos='sticky' h='fit-content' top={72}>
                <ProfileApplicantContacts data={baseInfo || baseInfoById} />
                {baseInfoById && (
                    <>
                        <ProfileCommentsByCandidate baseInfoById={baseInfoById} />
                        {baseInfoById.ai_summary && <ProfileSummaryByCandidate summary={baseInfoById.ai_summary} />}
                    </>
                )}
            </Flex>
            <ProfileApplicantInfo
                baseInfo={baseInfo || baseInfoById}
                experience={experience || experienceById}
                education={education || educationById}
            />
        </Flex>
    );
};
