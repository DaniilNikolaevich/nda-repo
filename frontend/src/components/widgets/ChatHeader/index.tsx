import { Avatar, Flex, Group, Paper, SegmentedControl, Stack, Text, Title } from '@mantine/core';
import { useUnit } from 'effector-react';
import { useRouter } from 'next/router';

import { $isRecruiter, useGetAllMyChatsQuery } from '@/services';

interface ChatHeaderProps {
    onChangeMessageType: (value: string) => void;
}

export const ChatHeader = ({ onChangeMessageType }: ChatHeaderProps) => {
    const {
        query: { chatId },
    } = useRouter();

    const isRecruiter = useUnit($isRecruiter);

    const { currentChat } = useGetAllMyChatsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            currentChat: data?.chats.find((el) => el.id === chatId),
        }),
    });

    return (
        <Paper style={{ zIndex: 1 }} pos='sticky' top={0} radius={0} py={16} px={40}>
            <Flex justify='space-between' align='center'>
                <Stack gap={20}>
                    <Title fz={24} order={2}>
                        {currentChat?.name}
                    </Title>
                    <Group align='start'>
                        <Avatar
                            w={60}
                            h={60}
                            radius='md'
                            src={
                                isRecruiter
                                    ? currentChat?.candidate?.avatar_thumbnail_url
                                    : currentChat?.recruiter?.avatar_thumbnail_url
                            }
                        />
                        <Stack gap={0}>
                            <Text fw={600} fz={18}>
                                {isRecruiter ? currentChat?.candidate?.fullname : currentChat?.recruiter?.fullname}
                            </Text>
                            <Text mih={14} c='dimmed' fz={16}>
                                {isRecruiter
                                    ? currentChat?.candidate?.info?.preferred_position?.name
                                    : currentChat?.recruiter?.email}
                            </Text>
                        </Stack>
                    </Group>
                </Stack>
                <Stack gap={20}>
                    <SegmentedControl
                        data={[
                            {
                                label: 'Все сообщения',
                                value: 'all',
                            },
                            {
                                label: 'Только системные',
                                value: 'system',
                            },
                        ]}
                        onChange={onChangeMessageType}
                    />
                </Stack>
            </Flex>
        </Paper>
    );
};
