import { Button, Flex, Paper, Text, Title } from '@mantine/core';
import { useRouter } from 'next/router';

import FiveHands from '@/_app/assets/images/FiveHands.svg';
import { BaseLayout } from '@/layouts';
import { useDeclinedDatesForInterviewMutation } from '@/services';
import { useTheme } from '@/shared/hooks';

function SelectedTimePage() {
    const { background } = useTheme();
    const {
        query: { interview_id },
    } = useRouter();
    const [declineInterview] = useDeclinedDatesForInterviewMutation();

    const handleDeclineDate = () => {
        declineInterview({
            interview: (interview_id as string) ?? '',
        });
    };

    return (
        <BaseLayout title='Приглашение на интервью'>
            <Paper p={20} bg={background} m='auto' miw={950} maw={950} radius='lg'>
                <Flex gap={20}>
                    <Flex direction='column' justify='center' gap={20}>
                        <Title order={3}>Ваше интервью запланировано</Title>
                        <Text>Ссылка на встречу будет направлена вам в чате и по электронной почте.</Text>
                    </Flex>
                    <FiveHands />
                </Flex>
                <Flex justify='flex-start' align='center'>
                    <Button variant='light' color='red' onClick={handleDeclineDate}>
                        Отказаться от интервью
                    </Button>
                </Flex>
            </Paper>
        </BaseLayout>
    );
}

export default SelectedTimePage;
