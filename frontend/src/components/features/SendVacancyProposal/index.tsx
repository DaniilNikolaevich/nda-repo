import { useEffect } from 'react';
import { Button, FileInput, Flex, Grid, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Paperclip } from '@phosphor-icons/react/dist/ssr/Paperclip';
import { useUnit } from 'effector-react';
import { zodResolver } from 'mantine-form-zod-resolver';

import { $isRecruiter, useGetMainInfoByMeQuery, useSubscribeOnVacanciesMutation } from '@/services';
import { ACCEPTED_FILE_TYPE } from '@/shared/constants';
import { FormContainer } from '@/shared/ui';
import { dataFormObject } from '@/shared/utils';
import { VacancyProposal } from '@/shared/validate';

import EnvelopeImage from './assets/Envelope.svg';
import s from './SendVacancyProposal.module.css';

export const SendVacancyProposal = () => {
    const isRecruiter = useUnit($isRecruiter);
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            snp: '',
            email: '',
            cv_file: null,
        },
        validate: zodResolver(VacancyProposal),
    });

    const { data: meInfo } = useGetMainInfoByMeQuery(null, {
        refetchOnMountOrArgChange: true,
    });

    const [subscribeOnVacancies, { isError, isSuccess }] = useSubscribeOnVacanciesMutation();

    const keys = {
        snp: form.getInputProps('snp'),
        email: form.getInputProps('email'),
        cv_file: form.getInputProps('cv_file'),
    };

    const onSubmit = form.onSubmit((values) => {
        const formData = dataFormObject(values);

        subscribeOnVacancies(formData);
    });

    useEffect(() => {
        if (meInfo) {
            form.initialize({
                snp: meInfo.user?.fullname ?? '',
                email: meInfo.user?.email ?? '',
                cv_file: null,
            });
        }
    }, [meInfo]);

    useEffect(() => {
        if (isError) {
            notifications.show({
                title: 'Произошла ошибка!',
                message: 'Не удалось подписаться',
                color: 'red',
            });
        }

        if (isSuccess) {
            notifications.show({
                title: 'Успех!',
                message: 'Подписка успешно оформлена',
                color: 'green',
            });
        }
    }, [isSuccess, isError]);

    if (isRecruiter) return null;

    return (
        <Paper className={s.root} withBorder bg='indigo.0'>
            <Stack gap='var(--size-sm)' className={s.content}>
                <Title order={3} fz={20}>
                    Не нашли подходящую вакансию?
                </Title>
                <Text>Оставьте ваши контакты и резюме. Мы подберем вакансию для вас!</Text>
                <FormContainer
                    className={s.form}
                    bg='transparent'
                    px={0}
                    py={0}
                    onSubmit={onSubmit}
                    gap='var(--size-sm)'
                >
                    <TextInput placeholder='Иванов Олег Аскелладович' label='ФИО' {...keys.snp} />
                    <Grid gutter='var(--size-sm)' w='100%' justify='stretch'>
                        <Grid.Col span={6}>
                            <TextInput placeholder='info@mail.ru' label='E-mail' {...keys.email} />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <FileInput
                                accept={ACCEPTED_FILE_TYPE.resume.mediaTypes.join(',')}
                                placeholder='Файл в формате PDF'
                                label='Резюме'
                                {...keys.cv_file}
                                rightSection={<Paperclip />}
                            />
                        </Grid.Col>
                    </Grid>
                    <Button type='submit' w='fit-content'>
                        Отправить
                    </Button>
                </FormContainer>
            </Stack>
            <EnvelopeImage className={s.image} />
        </Paper>
    );
};
