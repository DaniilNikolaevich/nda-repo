import { memo } from 'react';
import { Anchor, Button, Center, Flex, Text } from '@mantine/core';
import Link from 'next/link';

export const Controls = memo(({ isLoading }: { isLoading: boolean }) => (
    <Flex direction='column' align='flex-start' gap='xs'>
        <Button type='submit' fullWidth loading={isLoading}>
            Войти
        </Button>
        <Button mb='xs' fullWidth component={Link} href='/restore' variant='subtle'>
            Я не помню пароль
        </Button>
        <Center w='100%'>
            <Text fw='600' size='sm'>
                Хочу&nbsp;
                <Anchor fw='600' component={Link} href='/registration' variant='subtle'>
                    зарегистрироваться
                </Anchor>
            </Text>
        </Center>
    </Flex>
));

Controls.displayName = 'AuthorizationControls';
