import { Button, Flex, Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';

import { VacancyModel } from '@/shared/types/common-models';

export const InviteApplicantForVacancy = ({
    vacancies,
    onSelect,
    candidate_id,
}: {
    candidate_id: string;
    vacancies?: VacancyModel[];
    onSelect?: ({ candidate, vacancy }: { candidate: string; vacancy: string }) => void;
}) => (
    <Menu shadow='md' width={270}>
        <Menu.Target>
            <Button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <Flex gap={8} align='center'>
                    Отобрать на вакансию <CaretDown weight='bold' size={16} />
                </Flex>
            </Button>
        </Menu.Target>

        <Menu.Dropdown>
            {vacancies?.map(({ id, position }) => (
                <Menu.Item
                    key={id}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect?.({
                            candidate: candidate_id,
                            vacancy: id,
                        });
                        notifications.show({
                            title: 'Успешно!',
                            message: 'Кандидат успешно добавлен в подборку',
                        });
                    }}
                >
                    {position?.name}
                </Menu.Item>
            ))}
        </Menu.Dropdown>
    </Menu>
);
