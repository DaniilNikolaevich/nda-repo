import { useEffect, useState } from 'react';
import { Flex, Loader } from '@mantine/core';
import { useRouter } from 'next/router';

import { ProfileCommentsByCandidate, ProfileSummaryByCandidate } from '@/components/features';
import {
    useGetAllWorkExperienceByMeQuery,
    useGetAllWorkExperienceByUserQuery,
    useGetEducationByMeQuery,
    useGetEducationByUserQuery,
    useGetMainInfoByMeQuery,
    useGetMainInfoByUserQuery,
    useIsRecruiter,
} from '@/services';

import { ProfileApplicantContacts } from './ProfileApplicantContacts';
import { ProfileApplicantInfo } from './ProfileApplicantInfo';

export const UserProfile = () => {
    const router = useRouter();
    const [blocked, setBlocked] = useState(true);
    const [isRecruiter] = useIsRecruiter();
    const {
        query: { id },
    } = useRouter();

    const { data: baseInfo, isFetching: isFetchingBaseInfo } = useGetMainInfoByMeQuery(null, {
        skip: Boolean(id),
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

    useEffect(() => {
        if (!isRecruiter) {
            router.push('/');
        } else {
            setBlocked(false);
        }
    }, []);

    if (isFetching || blocked) {
        return (
            <Flex align='center' justify='center'>
                <Loader />
            </Flex>
        );
    }

    return (
        <Flex gap={20} justify='center' pos='relative'>
            <ProfileApplicantInfo
                baseInfo={baseInfo || baseInfoById}
                experience={experience || experienceById}
                education={education || educationById}
            />
            <Flex direction='column' gap={20} pos='sticky' h='fit-content' top={72}>
                <ProfileApplicantContacts data={baseInfo || baseInfoById} />
                {baseInfoById && (
                    <>
                        <ProfileCommentsByCandidate baseInfoById={baseInfoById} />
                        {baseInfoById.ai_summary && <ProfileSummaryByCandidate summary={baseInfoById.ai_summary} />}
                    </>
                )}
            </Flex>
        </Flex>
    );
};
