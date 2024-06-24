import { Button, Center, Container, Stack, Title } from '@mantine/core';
import Link from 'next/link';

import { BaseLayout } from '@/layouts';

import NotFound from '../_app/assets/images/404.svg';

export default function NotFoundPage() {
    return (
        <BaseLayout title='PeopleFlow | Страница не найдена'>
            <section>
                <Container>
                    <Center h='92vh'>
                        <Stack gap='var(--size-lg)' justify='center' align='center'>
                            <NotFound width='400px' height='400px' />
                            <Title fz={40} style={{ textAlign: 'center' }}>
                                Страница не найдена
                            </Title>
                            <Button component={Link} href='/' w='fit-content'>
                                Перейти на главную
                            </Button>
                        </Stack>
                    </Center>
                </Container>
            </section>
        </BaseLayout>
    );
}
