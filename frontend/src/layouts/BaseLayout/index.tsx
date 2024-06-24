import type { PropsWithChildren } from 'react';
import { AppShell } from '@mantine/core';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Header = dynamic(() => import('./ui/Header'), { ssr: false });

interface BaseLayout {
    title?: string;
    description?: string;
}

export function BaseLayout({ title, description, children }: PropsWithChildren<BaseLayout>) {
    const { pathname } = useRouter();

    return (
        <>
            <Head>
                {title && <title>{title}</title>}
                {description && <meta name='description' content={description} />}
            </Head>
            <AppShell header={{ height: 60 }} padding='md'>
                <Header />
                <AppShell.Main pb={pathname.includes('chats') ? 0 : 'var(--size-md)'}>{children}</AppShell.Main>
            </AppShell>
        </>
    );
}
