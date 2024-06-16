import { useMemo } from 'react';
import { ActionIcon, Button, Combobox, Flex, Text, useCombobox } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ArrowsClockwise } from '@phosphor-icons/react/dist/ssr/ArrowsClockwise';
import { skipToken } from '@reduxjs/toolkit/query';

import { useSelectedVacancy } from '@/components/widgets/RecruitingProcess/model/useSelectedVacancy';
import { useChangeAllowedStepMutation, useGetAllowedStepsQuery } from '@/services';
import { RECRUITER_FLOW_MAPPER, RECRUITER_FLOW_STEPS } from '@/shared/constants/recruiterFlowSteps';

export const StatusChanger = () => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const { selectedProcessUser, setProcessStep } = useSelectedVacancy();
    const { data: allowedSteps, refetch } = useGetAllowedStepsQuery(selectedProcessUser ?? skipToken, {
        refetchOnMountOrArgChange: true,
    });
    const [changeStep, { isLoading }] = useChangeAllowedStepMutation();

    const options = useMemo(
        () =>
            allowedSteps?.map((item) => (
                <Combobox.Option value={item.toString()} key={item}>
                    {RECRUITER_FLOW_MAPPER[item]}
                </Combobox.Option>
            )),
        [allowedSteps]
    );

    return (
        <Combobox
            store={combobox}
            width={250}
            position='bottom-end'
            withArrow
            onOptionSubmit={(val: string) => {
                const el = allowedSteps?.find((el) => el.toString() === val);
                if (el && selectedProcessUser) {
                    changeStep({
                        step: el,
                        recruiter_flow_id: selectedProcessUser,
                    });
                    setProcessStep?.(el);
                    notifications.show({
                        title: 'Успшно!',
                        message: `Статус сменен на ${RECRUITER_FLOW_MAPPER[el]}`,
                    });
                }
                combobox.closeDropdown();
            }}
        >
            <Flex align='center' gap='var(--size-lg)' hidden={!allowedSteps || allowedSteps.length < 1}>
                <Combobox.Target>
                    <Button
                        loading={isLoading}
                        leftSection={<ArrowsClockwise size={20} />}
                        onClick={() => combobox.toggleDropdown()}
                    >
                        Сменить шаг
                    </Button>
                </Combobox.Target>
            </Flex>
            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};
