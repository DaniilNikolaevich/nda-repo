import { useEffect, useState } from 'react';
import { TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

export const EntitySearchBar = ({ placeholder = 'Найти вакансию' }: { placeholder?: string }) => {
    const searchParams = useSearchParams();
    const [value, setValue] = useState<string>('');
    const { replace, pathname } = useRouter();

    const handleSearch = useDebouncedCallback(async () => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('search', value);
            params.set('page', '1');
        } else {
            params.delete('search');
        }

        await replace(`${pathname}?${params.toString()}`);
    }, 300);

    useEffect(() => {
        handleSearch();
    }, [value]);

    useEffect(() => {
        if (searchParams) {
            setValue(searchParams.get('search') ?? '');
        }
    }, [searchParams]);

    return (
        <TextInput
            style={{ flexGrow: 1 }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            leftSection={<MagnifyingGlass />}
            placeholder={placeholder}
        />
    );
};
