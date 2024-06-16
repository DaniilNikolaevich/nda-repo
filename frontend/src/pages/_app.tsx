import { useEffect } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';

import 'dayjs/locale/ru';

import { ThemeProvider } from '@/_app/providers';
import StoreProvider from '@/_app/providers/StoreProvider';
import { setAuthorization, STORAGE } from '@/services';

import '../_app/styles/styles.scss';

dayjs.locale('ru');
dayjs.extend(localizedFormat);

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap', weight: ['400', '600'] });

const TopProgress = dynamic(() => import('../shared/ui/TopProgressBar/index.async'), {
    ssr: false,
});

function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        const token = STORAGE.getToken();
        if (!token) {
            setAuthorization(false);
            return;
        }
        setAuthorization(true);
    }, []);
    return (
        <ThemeProvider>
            <StoreProvider>
                <TopProgress />
                <div className={clsx(pageProps.className, inter.className)}>
                    <Component {...pageProps} />
                </div>
            </StoreProvider>
        </ThemeProvider>
    );
}

export default App;
