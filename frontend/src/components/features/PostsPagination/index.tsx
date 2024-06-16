import { useEffect, useState } from 'react';
import { Pagination } from '@mantine/core';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

export const PostsPagination = ({ total }: { total: number }) => {
    const searchParams = useSearchParams();
    const [value, setValue] = useState(Number(searchParams.get('page')) ?? 1);
    const { replace, pathname } = useRouter();

    const onChange = async (value: number) => {
        const params = new URLSearchParams(searchParams);
        setValue(value);
        params.set('page', value.toString());
        await replace(`${pathname}?${params.toString()}`);
    };

    useEffect(() => {
        setValue(Number(searchParams.get('page')));
    }, [searchParams]);

    return <Pagination total={total} value={value === 0 ? 1 : value} onChange={onChange} />;
};
