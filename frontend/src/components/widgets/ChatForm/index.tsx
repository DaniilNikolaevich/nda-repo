import { useRef } from 'react';
import { Button, Flex, Paper } from '@mantine/core';
import { useForm } from '@mantine/form';
import { getHotkeyHandler, useHotkeys } from '@mantine/hooks';
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
    const editorRef = useRef<HTMLDivElement | null>(null);
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
        editor?.commands.clearContent();
        editor?.commands.focus();
        if (window) {
            window.scrollTo(0, document.body.scrollHeight);
        }
    });

    return (
        <Paper pos='sticky' bottom={0} w='100%' p={20}>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <form onSubmit={onSendMessageHandler} onKeyDown={getHotkeyHandler([['mod+Enter', onSendMessageHandler]])}>
                <Flex gap={12} align='center'>
                    <RichTextEditor
                        ref={editorRef}
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
