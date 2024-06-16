import { type PropsWithChildren, useEffect, useState } from 'react';
import { Loader } from '@mantine/core';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import querystring from 'query-string';

import { useGetRole } from '@/shared/hooks';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
    const searchParams = useSearchParams();
    const { replace, pathname } = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const { isRecruiter, isAuth } = useGetRole();

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (!isAuth) {
            replace('/auth');
        } else {
            setIsLoading(false);
            if (pathname.includes('recruiter')) {
                if (!isRecruiter) {
                    replace('/');
                } else {
                    replace(
                        `${pathname}?${params ? querystring.stringify(params) : querystring.stringify(searchParams)}`
                    );
                }
            }
        }
    }, []);

    return isLoading ? <Loader pos='absolute' top='50%' left='50%' /> : children;
};
