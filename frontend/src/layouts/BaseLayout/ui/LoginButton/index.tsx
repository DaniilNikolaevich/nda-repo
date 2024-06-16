import { Button } from '@mantine/core';
import Link from 'next/link';

export function LoginButton() {
    return (
        <Button size='sm' component={Link} href='/auth'>
            Войти
        </Button>
    );
}
