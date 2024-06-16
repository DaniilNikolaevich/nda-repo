import { Box, Button, Flex, Popover, Text, TextInput, Title } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

import FiveHands from '@/_app/assets/images/FiveHands.svg';
import { BaseLayout } from '@/layouts';
import { useDeclinedDatesForInterviewMutation } from '@/services';

function SelectedTimePage() {
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
            <Flex
                p={20}
                gap={40}
                bg='white'
                m='auto'
                direction='column'
                miw={950}
                maw={950}
                style={{ borderRadius: 16 }}
            >
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
            </Flex>
        </BaseLayout>
    );
}

export default SelectedTimePage;
