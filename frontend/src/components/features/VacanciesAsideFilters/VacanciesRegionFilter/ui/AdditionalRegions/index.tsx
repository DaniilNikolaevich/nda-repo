import { useState } from 'react';
import { CheckIcon, Combobox, Group, PillsInput, useCombobox } from '@mantine/core';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';

import { useCitiesList } from '@/components/features/VacanciesAsideFilters/VacanciesRegionFilter/model';
import { useGetCitiesDictionaryQuery } from '@/services';

export const AdditionalRegions = () => {
    const [search, setSearch] = useState('');
    const { data } = useGetCitiesDictionaryQuery({
        search,
        itemsPerPage: 5,
    });
    const [value, { set: setValue }] = useCitiesList();

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
    });

    const handleValueSelect = (val: string) => {
        if (!data) return;
        setValue((current) => {
            if (current.find((el) => el.id === val)) {
                return current.filter((v) => v.id !== val);
            }
            return [
                ...current,
                {
                    id: val,
                    name: data?.payload?.find((el) => el.id === val)?.name,
                },
            ];
        });
    };

    const options = data?.payload
        .filter((item) => !value?.find((el) => el.name === item.name))
        .map((item) => (
            <Combobox.Option value={item.id} key={item.id} active={Boolean(value?.find((el) => el.id === item.id))}>
                <Group gap='sm'>
                    {value?.find((el) => el.id === item.id) ? <CheckIcon size={12} /> : null}
                    <span>{item.name}</span>
                </Group>
            </Combobox.Option>
        ));

    return (
        <Combobox store={combobox} onOptionSubmit={handleValueSelect} withinPortal={false}>
            <Combobox.DropdownTarget>
                <PillsInput onClick={() => combobox.openDropdown()} rightSection={<CaretDown />}>
                    <Combobox.EventsTarget>
                        <PillsInput.Field
                            onFocus={() => combobox.openDropdown()}
                            onBlur={() => combobox.closeDropdown()}
                            value={search}
                            placeholder='Выберите'
                            onChange={(event) => {
                                combobox.updateSelectedOptionIndex();
                                setSearch(event.currentTarget.value);
                            }}
                        />
                    </Combobox.EventsTarget>
                </PillsInput>
            </Combobox.DropdownTarget>

            <Combobox.Dropdown>
                <Combobox.Options>
                    {options && options?.length > 0 ? options : <Combobox.Empty>Ничего не найдено</Combobox.Empty>}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};
