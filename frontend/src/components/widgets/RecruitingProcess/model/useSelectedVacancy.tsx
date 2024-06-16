import {
    createContext,
    type Dispatch,
    type PropsWithChildren,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { isArray } from 'lodash-es';
import { useRouter } from 'next/router';

import { useGetAllowedStepsQuery, useRecruiterFlowsQuery } from '@/services';
import { useGetAllVacanciesForRecruiterQuery } from '@/services/VacanciesService';
import { RECRUITER_FLOW_STEPS } from '@/shared/constants/recruiterFlowSteps';
import type { InterviewModel, RecruitmentProcessModel, VacancyModel } from '@/shared/types/common-models';

interface SelectedVacancyContext {
    selectedVacancy?: VacancyModel | null;
    setSelectedVacancy?: Dispatch<SetStateAction<VacancyModel | null>>;
    setProcessStep?: Dispatch<SetStateAction<number>>;
    processStep?: number;
    tabsCounters?: Record<string, number>;
    filteredProcessModel?: RecruitmentProcessModel[];
    setSelectedProcessUser?: Dispatch<SetStateAction<string>>;
    selectedProcessUser?: string;
    setFilteredProcessModel?: Dispatch<SetStateAction<RecruitmentProcessModel[]>>;
    selectedUser?: string;
    interviewStatus?: null | InterviewModel;
}

const SelectedVacancyContext = createContext<SelectedVacancyContext>({});

export const SelectedVacancyContextProvider = ({ children }: PropsWithChildren) => {
    const {
        query: { id },
    } = useRouter();
    const [processStep, setProcessStep] = useState<number>(RECRUITER_FLOW_STEPS.RESPONSES);
    const { data: vacanciesModel } = useGetAllVacanciesForRecruiterQuery({
        status__in: 1,
    });
    const { data: processModel } = useRecruiterFlowsQuery(!id || isArray(id) ? skipToken : id, {
        refetchOnMountOrArgChange: true,
    });

    const vacancyByQueryId = vacanciesModel?.payload?.filter((vacancy) => vacancy.id === id);
    const [selectedVacancy, setSelectedVacancy] = useState<VacancyModel | null>(vacancyByQueryId?.[0] ?? null);

    const [tabsCounters, setTabsCounters] = useState<Record<string, number>>({});

    const [filteredProcessModel, setFilteredProcessModel] = useState<RecruitmentProcessModel[]>([]);

    const [selectedProcessUser, setSelectedProcessUser] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [interviewStatus, setInterviewStatus] = useState<InterviewModel | null>(null);

    useEffect(() => {
        if (!vacanciesModel) return;
        setSelectedVacancy(vacancyByQueryId?.[0] ?? null);
    }, [vacanciesModel]);

    useEffect(() => {
        if (!processModel) return;
        const responses = processModel.filter((model) => model.step.id === RECRUITER_FLOW_STEPS.RESPONSES).length;
        const selected = processModel.filter((model) => model.step.id === RECRUITER_FLOW_STEPS.SELECTED).length;
        const general = processModel.filter((model) => model.step.id === RECRUITER_FLOW_STEPS.GENERAL_INTERVIEW).length;
        const pending = processModel.filter((model) => model.step.id === RECRUITER_FLOW_STEPS.PENDING_APPROVAL).length;
        const technical = processModel.filter(
            (model) => model.step.id === RECRUITER_FLOW_STEPS.TECHNICAL_INTERVIEW
        ).length;
        const additional = processModel.filter(
            (model) => model.step.id === RECRUITER_FLOW_STEPS.ADDITIONAL_INTERVIEW
        ).length;
        const offer = processModel.filter((model) => model.step.id === RECRUITER_FLOW_STEPS.OFFER).length;
        const refused = processModel.filter((model) => model.step.id === RECRUITER_FLOW_STEPS.REFUSED).length;
        const deleted = processModel.filter((model) => model.step.id === RECRUITER_FLOW_STEPS.DELETED).length;

        setTabsCounters({
            [RECRUITER_FLOW_STEPS.RESPONSES]: responses,
            [RECRUITER_FLOW_STEPS.SELECTED]: selected,
            [RECRUITER_FLOW_STEPS.GENERAL_INTERVIEW]: general,
            [RECRUITER_FLOW_STEPS.PENDING_APPROVAL]: pending,
            [RECRUITER_FLOW_STEPS.TECHNICAL_INTERVIEW]: technical,
            [RECRUITER_FLOW_STEPS.ADDITIONAL_INTERVIEW]: additional,
            [RECRUITER_FLOW_STEPS.OFFER]: offer,
            [RECRUITER_FLOW_STEPS.REFUSED]: refused,
            [RECRUITER_FLOW_STEPS.DELETED]: deleted,
        });
    }, [processModel]);

    useEffect(() => {
        if (!processModel) return;
        setFilteredProcessModel(() => processModel?.filter((el) => el.step.id === processStep));
    }, [processStep]);

    useEffect(() => {
        if (!processModel) return;
        if (!selectedProcessUser) {
            setSelectedProcessUser(processModel?.filter((el) => el.step.id === processStep)?.[0]?.id);
        }
        setFilteredProcessModel(() => processModel?.filter((el) => el.step.id === processStep));
    }, [processModel]);

    useEffect(() => {
        const findUserBySelectedProcess = filteredProcessModel.find((el) => el.id === selectedProcessUser)?.candidate
            ?.id;
        const findInterviewStatusBySelectedProcess = filteredProcessModel.find(
            (el) => el.id === selectedProcessUser
        )?.interview;

        setSelectedUser(findUserBySelectedProcess ?? '');
        setInterviewStatus(findInterviewStatusBySelectedProcess ?? null);
    }, [selectedProcessUser, processModel, filteredProcessModel]);

    const memoizedValues = useMemo(
        () => ({
            selectedVacancy,
            processStep,
            setSelectedVacancy,
            setProcessStep,
            setSelectedProcessUser,
            setFilteredProcessModel,
            tabsCounters,
            filteredProcessModel,
            selectedProcessUser,
            selectedUser,
            interviewStatus,
        }),
        [
            selectedVacancy,
            interviewStatus,
            selectedUser,
            processStep,
            selectedProcessUser,
            processModel,
            tabsCounters,
            filteredProcessModel,
        ]
    );

    return <SelectedVacancyContext.Provider value={memoizedValues}>{children}</SelectedVacancyContext.Provider>;
};

export const useSelectedVacancy = () => {
    const ctx = useContext(SelectedVacancyContext);
    if (!ctx) {
        throw new Error('Context must be used in provider');
    }

    return ctx;
};
