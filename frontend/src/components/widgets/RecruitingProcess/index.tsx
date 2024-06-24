import { Box, Divider, Flex, Paper, Title } from '@mantine/core';

import { useSelectedVacancy } from './model/useSelectedVacancy';
import {
    VacanciesProcessesTab,
    VacanciesStatusScreen,
    VacancyMainScreen,
    VacancyPicker,
    VacancyProcessSidebar,
} from './ui';

export const RecruitingProcess = () => {
    const { filteredProcessModel, selectedProcessUser } = useSelectedVacancy();

    const isExistsProcessModel = filteredProcessModel && filteredProcessModel.length > 0;

    return (
        <Paper px='var(--size-lg)' mih='calc(84vh)'>
            <Box>
                <VacancyPicker />
                <VacanciesProcessesTab />
            </Box>
            <Flex gap='var(--size-lg)'>
                <VacancyProcessSidebar />
                <Divider orientation='vertical' />
                {isExistsProcessModel && selectedProcessUser && (
                    <>
                        <VacancyMainScreen />
                        <Divider orientation='vertical' />
                        <VacanciesStatusScreen />
                    </>
                )}
                {!isExistsProcessModel && <Title order={3}>В данном разделе подходящих данных не найдено</Title>}
            </Flex>
        </Paper>
    );
};
