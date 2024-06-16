export const RECRUITER_FLOW_STEPS = {
    RESPONSES: 0,
    SELECTED: 1,
    GENERAL_INTERVIEW: 2,
    PENDING_APPROVAL: 3,
    TECHNICAL_INTERVIEW: 4,
    ADDITIONAL_INTERVIEW: 5,
    OFFER: 6,
    REFUSED: 7,
    DELETED: 8,
} as const;

export const RECRUITER_FLOW_MAPPER = {
    0: 'Отклики',
    1: 'Отобранные',
    2: 'Общее интервью',
    3: 'Ожидает согласования',
    4: 'Тех. интервью',
    5: 'Доп. интервью',
    6: 'Оффер',
    7: 'Отказ',
    8: 'Удаленные',
};
