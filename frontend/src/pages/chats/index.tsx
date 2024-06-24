import { Flex, Grid, Loader, Paper, Title, useMantineColorScheme, VisuallyHidden } from '@mantine/core';

import { useChat } from '@/_app/providers';
import { ChatForm, ChatHeader, ChatList, ChatMessages } from '@/components/widgets';
import { EmptyState } from '@/components/widgets/EmptyState';
import { BaseLayout } from '@/layouts';

import s from './ChatsPage.module.css';

function ChatsPage() {
    const { colorScheme } = useMantineColorScheme();
    const isDarkTheme = colorScheme === 'dark';
    const { isLoading, isChatsExists, chatId, messageType, handleChangeMessageType } = useChat();

    return (
        <BaseLayout title='Чаты'>
            <section>
                <VisuallyHidden>Страница чатов</VisuallyHidden>
                <Paper mt={-16} mx={-16}>
                    {isLoading && <Loader pos='fixed' top='50%' left='50%' />}
                    <Grid className={s.root} h='calc(100vh - 69px)'>
                        <Grid.Col span={3} p={0} h='calc(100vh - 69px)' style={{ overflow: 'auto' }}>
                            <Paper radius={0} component='aside' className={s.aside}>
                                <Title py={12} px={20} fz={32} mb={20}>
                                    Чаты
                                </Title>
                                {!isLoading && isChatsExists && <ChatList />}
                            </Paper>
                        </Grid.Col>
                        <Grid.Col
                            id='chat-container'
                            bg={isDarkTheme ? '' : 'gray.0'}
                            p={0}
                            span={9}
                            h='calc(100vh - 69px)'
                            style={{ overflowY: 'auto' }}
                        >
                            <EmptyState show={isChatsExists} />
                            {!isLoading && isChatsExists && chatId && (
                                <>
                                    <ChatHeader onChangeMessageType={handleChangeMessageType} />
                                    <Flex h='calc(100% - 144px)' direction='column'>
                                        <ChatMessages messageType={messageType} />
                                        <ChatForm />
                                    </Flex>
                                </>
                            )}
                        </Grid.Col>
                    </Grid>
                </Paper>
            </section>
        </BaseLayout>
    );
}

export default ChatsPage;
