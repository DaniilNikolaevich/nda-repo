import { Button, Flex, Paper, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { RichTextEditor } from '@mantine/tiptap';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { isArray } from 'lodash-es';
import { useRouter } from 'next/router';

import { useSendChatMessageMutation } from '@/services';

export const ChatForm = () => {
    const {
        query: { chatId },
    } = useRouter();
    const [sendMessage] = useSendChatMessageMutation();
    const form = useForm<{ message: string }>({
        initialValues: {
            message: '',
        },
    });
    const editor = useEditor({
        extensions: [StarterKit, Placeholder.configure({ placeholder: 'Введите сообщение' })],
        content: '',
        onUpdate(props) {
            const content = props.editor.getHTML();
            form.setFieldValue('message', content);
        },
    });

    const onSendMessageHandler = form.onSubmit((values) => {
        if (values.message.length < 1 || !chatId || isArray(chatId)) return;
        sendMessage({
            message: values.message,
            chat_id: chatId,
        });
        form.reset();
        if (window) {
            window.scrollTo(0, document.body.scrollHeight);
        }
    });

    return (
        <Paper pos='sticky' bottom={0} w='100%' p={20}>
            <form onSubmit={onSendMessageHandler}>
                <Flex gap={12} align='center'>
                    <RichTextEditor
                        w='calc(100% - 160px)'
                        p={0}
                        styles={{
                            root: {
                                padding: 0,
                            },
                        }}
                        editor={editor}
                    >
                        <RichTextEditor.Content />
                    </RichTextEditor>
                    <Button size='lg' type='submit'>
                        Отправить
                    </Button>
                </Flex>
            </form>
        </Paper>
    );
};
