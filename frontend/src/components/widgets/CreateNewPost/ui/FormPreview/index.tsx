import { Box, Flex, Image, Paper, Pill, PillGroup, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import NextImage from 'next/image';

import { usCreateNewPostContext } from '@/components/widgets/CreateNewPost/model';

export const FormPreview = ({
    isPreview,
    setIsPreview,
    image,
}: {
    isPreview: boolean;
    setIsPreview: (b: boolean) => void;
    image: string;
}) => {
    const { getValues } = usCreateNewPostContext();

    const { content, tags, title } = getValues();

    if (!isPreview) return null;

    return (
        <Flex direction='column' gap='var(--size-xl)' mb='var(--size-lg)'>
            <Paper radius={16} h={420} style={{ overflow: 'hidden' }}>
                {image && <Image alt='image' component={NextImage} src={image} width={870} height={420} />}
            </Paper>
            <Flex justify='space-between' align='center'>
                {tags && (
                    <PillGroup>
                        {tags.map((tag) => (
                            <Pill key={tag?.id}>{tag?.name}</Pill>
                        ))}
                    </PillGroup>
                )}
                <Text size='sm' c='dimmed' component='time' dateTime={dayjs().format('YYYY-MM-DD')}>
                    {dayjs().format('DD.MM.YYYY')}
                </Text>
            </Flex>
            <Title order={4}>{title}</Title>
            <Box className='editor-preview' dangerouslySetInnerHTML={{ __html: content }} />
        </Flex>
    );
};
