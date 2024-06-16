import { memo } from 'react';
import { Anchor, Button, Center, Flex, Text } from '@mantine/core';
import { nprogress } from '@mantine/nprogress';
import Link from 'next/link';

export const Controls = memo(({ isLoading }: { isLoading: boolean }) => (
    <Flex direction='column' align='flex-start' gap='sm'>
        <Button type='submit' fullWidth form='registration-form' loading={isLoading}>
            Зарегистрироваться
        </Button>
        <Center w='100%' mb='xs'>
            <Text size='sm'>
                Нажимая «Зарегистрироваться», вы принимаете условия{' '}
                <Anchor component={Link} href='/terms' variant='subtle'>
                    пользовательского соглашения
                </Anchor>
            </Text>
        </Center>
        <Center w='100%'>
            <Text fw='600' size='sm'>
                Уже есть профиль.&nbsp;
                <Anchor fw='600' component={Link} href='/auth' variant='subtle'>
                    Войти
                </Anchor>
            </Text>
        </Center>
    </Flex>
));

Controls.displayName = 'AuthorizationControls';
