import { useMemo } from 'react';
import { ActionIcon, Combobox, Flex, Text, useCombobox } from '@mantine/core';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { useRouter } from 'next/router';

import { useSelectedVacancy } from '@/components/widgets/RecruitingProcess/model/useSelectedVacancy';
import { useGetAllVacanciesForRecruiterQuery } from '@/services/VacanciesService';

export const VacancyPicker = () => {
    const {
        query: { slug },
        push,
        pathname,
    } = useRouter();
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const { data: vacanciesModel } = useGetAllVacanciesForRecruiterQuery({
        status__in: 1,
    });
    const { selectedVacancy, setSelectedVacancy } = useSelectedVacancy();

    const options = useMemo(
        () =>
            vacanciesModel?.payload.map((item) => (
                <Combobox.Option value={item.id} key={item.id}>
                    {item.position.name}
                </Combobox.Option>
            )),
        [vacanciesModel]
    );

    return (
        <Combobox
            store={combobox}
            width={250}
            position='bottom-start'
            withArrow
            onOptionSubmit={(val: string) => {
                const el = vacanciesModel?.payload.find((el) => el.id === val);
                if (el) {
                    setSelectedVacancy?.(el);
                }
                combobox.closeDropdown();
                push({
                    pathname,
                    query: {
                        slug,
                        id: val,
                    },
                });
            }}
        >
            <Flex align='center' gap='var(--size-lg)'>
                <Text py='var(--size-lg)' fz={24} fw={600}>
                    {selectedVacancy?.position?.name || 'Выберите вакансию'}
                </Text>
                <Combobox.Target>
                    <ActionIcon size='lg' variant='light' onClick={() => combobox.toggleDropdown()}>
                        <CaretDown size={20} />
                    </ActionIcon>
                </Combobox.Target>
            </Flex>
            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};
