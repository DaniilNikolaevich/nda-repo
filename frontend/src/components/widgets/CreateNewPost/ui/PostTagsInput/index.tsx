import { useEffect, useState } from 'react';
import { CheckIcon, Combobox, Group, Pill, PillsInput, useCombobox } from '@mantine/core';
import { skipToken } from '@reduxjs/toolkit/query';
import { isArray, uniq } from 'lodash-es';
import { useRouter } from 'next/router';

import { usCreateNewPostContext } from '@/components/widgets/CreateNewPost/model';
import { useCreateNewsTagMutation, useGetArticleByIdQuery, useGetNewsTagsQuery } from '@/services/NewsService';
import type { TagModel } from '@/shared/types/common-models';

export const PostTagsInput = () => {
    const {
        query: { id },
    } = useRouter();
    const { data: article } = useGetArticleByIdQuery(id && !isArray(id) ? id : skipToken);

    const { setFieldValue } = usCreateNewPostContext();
    const { data: tags } = useGetNewsTagsQuery();
    const [createTag, { data }] = useCreateNewsTagMutation();

    const [value, setValue] = useState<TagModel[]>([]);
    const [search, setSearch] = useState('');

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
    });

    const exactOptionMatch = tags?.some((item) => item.name === search);

    const handleValueSelect = async (val: string) => {
        if (val === '$create') {
            await createTag({ name: search });
        } else {
            setSearch('');
            setValue((current) => {
                if (!current) {
                    return [];
                }

                const exists = current.some((el) => el.id === val);
                if (exists) {
                    return current.filter((el) => el.id !== val);
                }
                const element = tags?.find((el) => el.id === val);
                if (element) {
                    return [...current, element];
                }
                return current;
            });
        }
    };
    const handleValueRemove = (val: string) => setValue((current) => current?.filter((v) => v.id !== val));

    const values = value?.map((item, idx) => (
        <Pill key={idx.toString()} withRemoveButton onRemove={() => handleValueRemove(item.id)}>
            {item.name}
        </Pill>
    ));

    const options = tags
        ?.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()))
        .map((item) => (
            <Combobox.Option value={item.id} key={item.id} active={value?.includes(item)}>
                <Group gap='sm'>
                    {value?.find((el) => el.id === item.id) ? <CheckIcon size={12} /> : null}
                    <span>{item.name}</span>
                </Group>
            </Combobox.Option>
        ));

    useEffect(() => {
        if (data) {
            setValue((current) => current && [...current, { id: data.id, name: search }]);
            setSearch('');
        }
    }, [data]);

    useEffect(() => {
        setFieldValue('tags', value);
    }, [value]);

    useEffect(() => {
        if (!article || !tags) return;
        article.tags.forEach((tag) => {
            setValue((prev) => uniq([...prev, tags.find((t) => t.id === tag.id)]) as TagModel[]);
        });
    }, [article]);

    return (
        <Combobox store={combobox} onOptionSubmit={handleValueSelect} withinPortal={false}>
            <Combobox.DropdownTarget>
                <PillsInput label='Теги' onClick={() => combobox.openDropdown()}>
                    <Pill.Group>
                        {values}
                        <Combobox.EventsTarget>
                            <PillsInput.Field
                                onFocus={() => combobox.openDropdown()}
                                onBlur={() => combobox.closeDropdown()}
                                value={search}
                                placeholder='Введите теги'
                                onChange={(event) => {
                                    combobox.updateSelectedOptionIndex();
                                    setSearch(event.currentTarget.value);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Backspace' && search.length === 0) {
                                        event.preventDefault();
                                        if (!value) return;
                                        handleValueRemove(value[value.length - 1]?.id);
                                    }
                                }}
                            />
                        </Combobox.EventsTarget>
                    </Pill.Group>
                </PillsInput>
            </Combobox.DropdownTarget>

            <Combobox.Dropdown mah={200} style={{ overflow: 'auto' }}>
                <Combobox.Options>
                    {options}

                    {!exactOptionMatch && search.trim().length > 0 && (
                        <Combobox.Option value='$create'>+ Создать {search}</Combobox.Option>
                    )}

                    {exactOptionMatch && search.trim().length > 0 && options?.length === 0 && (
                        <Combobox.Empty>Ничего не найдено</Combobox.Empty>
                    )}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};
