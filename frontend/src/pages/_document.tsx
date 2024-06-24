import { ColorSchemeScript } from '@mantine/core';
import Document, { type DocumentContext, type DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        const initialProps = await Document.getInitialProps(ctx);
        return { ...initialProps };
    }

    render() {
        return (
            <Html>
                <Head lang='ru'>
                    <ColorSchemeScript defaultColorScheme='auto' />
                    <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
                    <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
                    <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
                    <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#5bbad5' />
                    <meta name='msapplication-TileColor' content='#da532c' />
                    <meta name='theme-color' content='#ffffff' />
                    <link rel='manifest' href='/manifest.json' />
                    <meta property='og:type' content='website' />
                    <meta property='og:title' content='PeopleFlow' />
                    <meta property='og:description' content='' />
                    <meta property='og:site_name' content='PeopleFlow' />
                    <meta property='og:url' content='https://peopleflow.ru' />
                    <meta property='og:image' content='/og.png' />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
