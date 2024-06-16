import { NavigationProgress, nprogress } from '@mantine/nprogress';
import Router from 'next/router';

export default function TopProgressBar() {
    let timer: string | number | NodeJS.Timeout;
    let state: 'loading' | 'stop';
    let activeRequests = 0;
    const delay = 250;

    function load() {
        if (state === 'loading') {
            return;
        }

        state = 'loading';

        timer = setTimeout(function () {
            nprogress.start();
        }, delay);
    }

    function stop() {
        if (activeRequests > 0) {
            return;
        }

        state = 'stop';

        clearTimeout(timer);
        nprogress.complete();
    }

    Router.events.on('routeChangeStart', load);
    Router.events.on('routeChangeComplete', stop);
    Router.events.on('routeChangeError', stop);

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        if (activeRequests === 0) {
            load();
        }

        activeRequests++;

        try {
            return await originalFetch(...args);
        } catch (error) {
            return Promise.reject(error);
        } finally {
            activeRequests -= 1;
            if (activeRequests === 0) {
                stop();
            }
        }
    };
    return <NavigationProgress />;
}

TopProgressBar.displayName = 'TopProgressBar';
