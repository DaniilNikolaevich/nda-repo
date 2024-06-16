import { Button, Drawer, Flex, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Sparkle } from '@phosphor-icons/react/dist/ssr/Sparkle';

interface ProfileSummaryByCandidateProps {
    summary: string;
}

export const ProfileSummaryByCandidate = ({ summary }: ProfileSummaryByCandidateProps) => {
    const [opened, { open, close }] = useDisclosure(false);

    const isOverflow = summary?.length >= 106;

    const handleOpenSummary = () => {
        open();
    };

    return (
        <Flex
            p={20}
            gap={20}
            bg='#EDF2FF'
            maw={310}
            miw={310}
            h='fit-content'
            direction='column'
            style={{ borderRadius: 16 }}
        >
            <Flex align='center' gap={8}>
                <Sparkle size={16} />
                <Title order={5}>Саммари резюме соискателя</Title>
            </Flex>
            <Flex direction='column' gap={20}>
                <Text style={{ fontSize: 14 }} lineClamp={3}>
                    {summary}
                </Text>
                {isOverflow && (
                    <Text c='dimmed' size='xs' style={{ cursor: 'pointer' }} onClick={handleOpenSummary}>
                        Читать дальше
                    </Text>
                )}
            </Flex>
            <Drawer opened={opened} position='right' onClose={close} title={<Title order={3}>AI саммари резюме</Title>}>
                <Text style={{ fontSize: 14 }}>{summary}</Text>
            </Drawer>
        </Flex>
    );
};
