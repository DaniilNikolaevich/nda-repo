import { useEffect } from 'react';
import { Button, Flex, Paper, Stack, Text, Title } from '@mantine/core';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { useCountdown } from 'usehooks-ts';

export const CheckEmailMessage = ({ email }: { email: string }) => {
    const [count, { startCountdown, resetCountdown }] = useCountdown({
        countStart: 59,
        intervalMs: 1000,
    });

    useEffect(() => {
        startCountdown();
    }, []);

    return (
        <Paper>
            <Title order={2} mb='var(--size-lg)'>
                <Flex align='center' gap='var(--size-xs)'>
                    <CheckCircle color='var(--accent)' />
                    Проверьте почту
                </Flex>
            </Title>
            <Stack mb='var(--size-lg)' gap='var(--size-sm)'>
                <Text>
                    На&nbsp;почтовый адрес <b>{email}</b> отправлена ссылка на&nbsp;создание пароля для входа
                    в&nbsp;профиль.
                </Text>
                <Text>
                    В&nbsp;профиле вы&nbsp;сможете отредактировать ваши личные данные и&nbsp;использовать их <br />
                    для отклика на&nbsp;вакансии.
                </Text>
                <Text>Если вы&nbsp;не&nbsp;можете найти письмо, проверьте, пожалуйста, папку &laquo;Спам&raquo;.</Text>
            </Stack>
            {count > 0 && <Text c='dimmed'>Повторная отправка доступна через {count} сек.</Text>}
            {count === 0 && (
                <Button type='submit' fullWidth>
                    Отправить письмо повторно
                </Button>
            )}
        </Paper>
    );
};
