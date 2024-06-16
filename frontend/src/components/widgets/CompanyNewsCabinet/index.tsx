import { type ChangeEvent, useEffect, useState } from 'react';
import { ActionIcon, Combobox, Flex, Pagination, TextInput, Title, useCombobox } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { ArrowsDownUp } from '@phosphor-icons/react/dist/ssr/ArrowsDownUp';
import { Funnel } from '@phosphor-icons/react/dist/ssr/Funnel';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { isEmpty, omitBy } from 'lodash-es';

import { ArticleEditCard } from '@/components/entities';
import { AddNewArticleButton, EditArticleButton, RemoveArticleButton } from '@/components/features';
import { useGetAllNewsQuery } from '@/services/NewsService';

import s from './CompanyNewsCabinet.module.css';

export const CompanyNewsCabinet = () => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const [isExternal, setIsExternal] = useState('Все новости');
    const [sortBy, setSortBy] = useState('');
    const [sortDesc, setSortDesc] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const getValue = (value: string) => {
        if (value === 'Все новости') return '';
        if (value === 'Только новости компании') return 'false';
        return 'true';
    };

    const { data: news, isLoading } = useGetAllNewsQuery(
        omitBy(
            {
                search,
                sortBy,
                is_external: getValue(isExternal),
                sortDesc: sortDesc.toString(),
                page: page.toString(),
            },
            isEmpty
        ),
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const handleSearch = useDebouncedCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    }, 300);

    const handleSort = () => {
        setSortBy((prev) => {
            if (prev === '') return 'created_at';
            return '';
        });
        setSortDesc((prev) => !prev);
        setPage(1);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [page]);

    const options = ['Все новости', 'Только новости компании', 'Только внешние новости'].map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    return (
        <>
            <Flex mb='var(--size-xl)' wrap='wrap' align='center' justify='space-between'>
                <Flex gap='var(--size-lg)' align='center'>
                    <Title order={3} fz={24}>
                        Новости компании
                    </Title>
                    <AddNewArticleButton />
                </Flex>
                <Flex maw={429} w='100%' gap='var(--size-sm)' align='center'>
                    <ActionIcon
                        disabled={isLoading}
                        onClick={handleSort}
                        variant={sortBy === '' ? 'light' : 'filled'}
                        size='lg'
                    >
                        <ArrowsDownUp weight='bold' />
                    </ActionIcon>
                    <Combobox
                        onOptionSubmit={(optionValue) => {
                            setIsExternal(optionValue);
                            combobox.closeDropdown();
                        }}
                        store={combobox}
                        withinPortal={false}
                    >
                        <Combobox.Target>
                            <ActionIcon
                                onClick={() => combobox.openDropdown()}
                                disabled={isLoading}
                                variant={isExternal === 'Все новости' ? 'light' : 'filled'}
                                size='lg'
                            >
                                <Funnel weight='bold' />
                            </ActionIcon>
                        </Combobox.Target>

                        <Combobox.Dropdown className={s.dropdown}>
                            <Combobox.Options w={200} mah={200} style={{ overflowY: 'auto' }}>
                                {options.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> : options}
                            </Combobox.Options>
                        </Combobox.Dropdown>
                    </Combobox>
                    <TextInput
                        maw={383}
                        w='100%'
                        value={searchValue}
                        onChange={(e) => {
                            handleSearch(e);
                            setSearchValue(e.target.value);
                        }}
                        leftSection={<MagnifyingGlass />}
                        placeholder='Найти новость'
                    />
                </Flex>
            </Flex>
            <Flex mb='var(--size-xl)' direction='column' gap='var(--size-lg)'>
                {news?.payload?.map((article) => (
                    <ArticleEditCard
                        key={article.id}
                        {...article}
                        editActionSlot={!article.is_external && <EditArticleButton id={article.id} />}
                        removeActionSlot={<RemoveArticleButton id={article.id} />}
                    />
                ))}
            </Flex>
            <Pagination total={news?.total_pages ?? 1} onChange={setPage} />
        </>
    );
};
