import { Tabs } from '@mantine/core';

import { useSelectedVacancy } from '@/components/widgets/RecruitingProcess/model/useSelectedVacancy';
import { RECRUITER_FLOW_STEPS } from '@/shared/constants/recruiterFlowSteps';

import { tabs } from './config';
import s from './VacanciesProcessesTab.module.css';

export const VacanciesProcessesTab = () => {
    const { setProcessStep, processStep, tabsCounters } = useSelectedVacancy();

    return (
        <Tabs
            mb='var(--size-lg)'
            defaultValue={RECRUITER_FLOW_STEPS.RESPONSES.toString()}
            onChange={(e) => {
                setProcessStep?.(Number(e));
            }}
            value={processStep?.toString()}
            className={s.root}
        >
            <Tabs.List>
                {tabs.map((tab) => (
                    <Tabs.Tab className={s.tab} key={tab.value} {...tab}>
                        {tab.content} ({tabsCounters?.[tab.value] ?? 0})
                    </Tabs.Tab>
                ))}
            </Tabs.List>
        </Tabs>
    );
};
