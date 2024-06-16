import { Flex, Stack, Text } from '@mantine/core';
import dayjs from 'dayjs';

import { CommentAboutUserModel } from '@/shared/types/common-models';

export const Comment = ({ comment }: { comment?: CommentAboutUserModel }) => (
    <Stack gap='var(--size-lg)'>
        <Flex justify='space-between'>
            <Text fz={12} c='dimmed'>
                {comment?.author.name} {comment?.author.surname}
            </Text>
            <Text fz={12} c='dimmed'>
                {dayjs(comment?.updated_at).format('DD.MM.YYYY HH:mm')}
            </Text>
        </Flex>
        <Text fz={14} lineClamp={2}>
            {comment?.text}
        </Text>
    </Stack>
);
