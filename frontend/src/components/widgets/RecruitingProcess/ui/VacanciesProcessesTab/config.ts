import { RECRUITER_FLOW_STEPS } from '@/shared/constants/recruiterFlowSteps';

export const tabs = [
    {
        value: RECRUITER_FLOW_STEPS.RESPONSES.toString(),
        content: 'Отклики',
    },
    {
        value: RECRUITER_FLOW_STEPS.SELECTED.toString(),
        content: 'Отобранные',
    },
    {
        value: RECRUITER_FLOW_STEPS.GENERAL_INTERVIEW.toString(),
        content: 'Общее интервью',
    },
    {
        value: RECRUITER_FLOW_STEPS.PENDING_APPROVAL.toString(),
        content: 'Ожидает согласования',
    },
    {
        value: RECRUITER_FLOW_STEPS.TECHNICAL_INTERVIEW.toString(),
        content: 'Тех. интервью',
    },
    {
        value: RECRUITER_FLOW_STEPS.ADDITIONAL_INTERVIEW.toString(),
        content: 'Доп. интервью',
    },
    {
        value: RECRUITER_FLOW_STEPS.OFFER.toString(),
        content: 'Оффер',
    },
    {
        value: RECRUITER_FLOW_STEPS.REFUSED.toString(),
        content: 'Отказ',
    },
    {
        value: RECRUITER_FLOW_STEPS.DELETED.toString(),
        content: 'Удаленные',
    },
];
