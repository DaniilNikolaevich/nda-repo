import type { PropsWithChildren } from 'react';
import {
    Button,
    Checkbox,
    Container,
    createTheme,
    DEFAULT_THEME,
    FileInput,
    MantineProvider,
    Menu,
    Radio,
    Tabs,
    Text,
    TextInput,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
    fontFamily: 'Inter, Montserrat, sans-serif',
    primaryColor: 'indigo',
    spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '28px',
        '3xl': '32px',
        '4xl': '40px',
    },
    cursorType: 'pointer',
    defaultRadius: 'md',
    headings: {
        fontFamily: 'Inter, Montserrat, sans-serif',
        sizes: {
            h2: {
                fontSize: '32px',
            },
            h4: {
                fontSize: '20px',
            },
        },
    },
    components: {
        Button: Button.extend({
            defaultProps: {
                radius: 8,
            },
        }),
        TextInput: TextInput.extend({
            styles: {
                label: {
                    marginBottom: '4px',
                    fontWeight: 600,
                },
            },
        }),
        FileInput: FileInput.extend({
            styles: {
                label: {
                    marginBottom: '4px',
                    fontWeight: 600,
                },
            },
        }),
        Text: Text.extend({
            styles: {
                root: {
                    fontFamily: 'Inter',
                    textWrap: 'pretty',
                },
            },
        }),
        Menu: Menu.extend({
            styles: {
                item: {
                    padding: '8px 12px',
                },
            },
        }),
        Container: Container.extend({
            vars: () => ({
                root: {
                    '--container-size': '1332px',
                },
            }),
        }),
        Tabs: Tabs.extend({
            styles: {
                tabLabel: {
                    fontSize: '16px',
                },
            },
        }),
        RadioGroup: Radio.Group.extend({
            styles: {
                label: {
                    marginBottom: 'var(--size-sm)',
                    fontWeight: 600,
                    fontSize: '14px',
                },
            },
        }),
        CheckboxGroup: Checkbox.Group.extend({
            styles: {
                label: {
                    marginBottom: 'var(--size-sm)',
                    fontWeight: 600,
                    fontSize: '14px',
                },
            },
        }),
        Checkbox: Checkbox.extend({
            vars: () => ({
                root: {
                    '--checkbox-radius': 'var(--size-xxs)',
                },
            }),
        }),
    },
});

export function ThemeProvider({ children }: PropsWithChildren) {
    return (
        <MantineProvider theme={theme} classNamesPrefix='app'>
            <Notifications />
            {children}
        </MantineProvider>
    );
}
