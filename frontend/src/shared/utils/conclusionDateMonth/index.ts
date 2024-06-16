type MonthNameType =
    | 'январь'
    | 'февраль'
    | 'март'
    | 'апрель'
    | 'май'
    | 'июнь'
    | 'июль'
    | 'август'
    | 'сентябрь'
    | 'октябрь'
    | 'ноябрь'
    | 'декабрь';

export const conclusionDateMonth = (monthName: MonthNameType) => {
    const monthEndings = {
        январь: 'я',
        февраль: 'я',
        март: 'а',
        апрель: 'я',
        май: '',
        июнь: '',
        июль: '',
        август: 'а',
        сентябрь: '',
        октябрь: '',
        ноябрь: '',
        декабрь: 'а',
    };

    const ending = monthEndings[monthName.toLowerCase() as MonthNameType];
    return monthName[0] + monthName.slice(1) + ending;
};
