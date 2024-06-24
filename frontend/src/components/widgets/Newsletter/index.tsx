import { type ChangeEventHandler, useState } from 'react';
import { Checkbox, Flex, RingProgress, Text, TextInput } from '@mantine/core';
import { Lightbulb } from '@phosphor-icons/react/dist/ssr/Lightbulb';

import { FormCategoryName } from '@/components/widgets/GenerallyDataForm/ui';
import { useGetProfileStatisticByMeQuery } from '@/services';
import { useIsLaptop } from '@/shared/hooks/media';

export const Newsletter = () => {
    const isDesktop = useIsLaptop();
    const [checkNews, setCheckNews] = useState(false);

    const { data } = useGetProfileStatisticByMeQuery(null, {
        refetchOnMountOrArgChange: true,
    });

    const handleCheckNews: ChangeEventHandler<HTMLInputElement> = (e) => {
        setCheckNews(e.currentTarget.checked);
    };

    return (
        <Flex
            maw={isDesktop ? 405 : '100%'}
            flex={isDesktop ? '1 0 100%' : '1 1 100%'}
            pos={isDesktop ? 'sticky' : 'static'}
            top={72}
            direction='column'
            gap={20}
            h='fit-content'
        >
            <Flex bg='white' p='var(--size-lg)' style={{ borderRadius: '16px' }} direction='column'>
                <FormCategoryName title='Заполнение профиля' />
                <Flex justify='center'>
                    <RingProgress
                        thickness={10}
                        sections={[
                            {
                                value: Math.floor(((data?.filled_fields ?? 1) / (data?.total_fields ?? 100)) * 100),
                                color: 'indigo',
                            },
                        ]}
                        label={
                            <Text c='indigo' fw={700} ta='center' size='xl'>
                                {Math.floor(((data?.filled_fields ?? 1) / (data?.total_fields ?? 100)) * 100)}%
                            </Text>
                        }
                    />
                </Flex>
                <Text c='dimmed' display='flex' size='xs' style={{ gap: 8 }}>
                    <Lightbulb size={32} />
                    Специалистов, у которых профиль заполнен полностью, приглашают на работу на 80% чаще.
                </Text>
            </Flex>
            {/*<Flex p='var(--size-lg)' direction='column' style={{ borderRadius: '16px', backgroundColor: 'white' }}>*/}
            {/*    <FormCategoryName title='Подписаться на рассылку' />*/}
            {/*    <Flex direction='column' gap='sm'>*/}
            {/*        <Checkbox*/}
            {/*            checked={checkNews}*/}
            {/*            label='Хочу получать предложения и новости на почту'*/}
            {/*            onChange={handleCheckNews}*/}
            {/*        />*/}
            {/*        <Text c='dimmed' size='xs'>*/}
            {/*            Мы будем присылать вам информацию о&nbsp;новых вакансиях и жизни компании. Никакого спама,*/}
            {/*            только полезное.*/}
            {/*        </Text>*/}
            {/*    </Flex>*/}
            {/*</Flex>*/}
        </Flex>
    );
};
