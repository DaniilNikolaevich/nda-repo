import { useEffect } from 'react';
import { Box, Button, Flex, Loader } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { isArray } from 'lodash-es';
import { zodResolver } from 'mantine-form-zod-resolver';

import { CabinetLayout } from '@/layouts';
import { useGetContactsDictionaryQuery, useGetMainInfoByMeQuery, usePatchUserContactsMutation } from '@/services';
import { FormContainer } from '@/shared/ui';
import { isMainContact } from '@/shared/utils';
import { UserContactsSchema } from '@/shared/validate';

import s from './ContactsForm.module.css';
import { UserContactsFormProvider, useUserContactsForm } from './model';
import { CheckboxInput, Controls, FormCategoryName, GeneralInput } from './ui';

export const ContactsForm = () => {
    const form = useUserContactsForm({
        mode: 'uncontrolled',
        name: 'user-contacts-form',
        initialValues: {
            mainContacts: [
                {
                    contact: { label: null, is_preferred: null, type: null, value: null, key: randomId() },
                },
            ],
            additionalContacts: [
                {
                    contact: { label: null, is_preferred: null, type: null, value: null, key: randomId() },
                },
            ],
        },
        validate: zodResolver(UserContactsSchema),
    });

    const { data, isLoading: isFetchingContacts } = useGetContactsDictionaryQuery();
    const { data: userInfo, isLoading: isFetchingInfo } = useGetMainInfoByMeQuery();
    const [patchUserContacts, { isError, isSuccess }] = usePatchUserContactsMutation();

    useEffect(() => {
        if (data && userInfo) {
            form.initialize({
                mainContacts: data
                    .filter(({ id }) => isMainContact(id))
                    .map(({ id, label }) => {
                        const curContact =
                            isArray(userInfo.contacts) && userInfo.contacts?.find(({ type }) => type === id);

                        return {
                            contact: {
                                is_preferred: curContact ? curContact.is_preferred : false,
                                value: curContact ? curContact.value : null,
                                label: label ?? null,
                                type: curContact ? curContact.type : id,
                                key: randomId(),
                            },
                        };
                    }),
                additionalContacts: data
                    .filter(({ id }) => !isMainContact(id))
                    .map(({ id, label }) => {
                        const curContact =
                            isArray(userInfo.contacts) && userInfo.contacts?.find(({ type }) => type === id);

                        return {
                            contact: {
                                is_preferred: curContact ? curContact.is_preferred : false,
                                value: curContact ? curContact.value : null,
                                label: label ?? null,
                                type: curContact ? curContact.type : id,
                                key: randomId(),
                            },
                        };
                    }),
            });
        }
    }, [data, userInfo]);

    const onSubmit = form.onSubmit((values) => {
        patchUserContacts({
            contacts: [...values.mainContacts, ...values.additionalContacts]?.map(({ contact }) => ({
                type: contact.type ?? 0,
                is_preferred: contact.is_preferred ?? false,
                value: contact.value ?? '',
            })),
        });
    });

    useEffect(() => {
        if (isError) {
            notifications.show({
                title: 'Произошла ошибка!',
                message: 'Не удалось сохранить данные',
                color: 'red',
            });
        }

        if (isSuccess) {
            notifications.show({
                title: 'Успех!',
                message: 'Данные успешно сохранены',
                color: 'green',
            });
        }
    }, [isSuccess, isError]);

    const isFetching = isFetchingContacts || isFetchingInfo;

    if (isFetching) {
        return (
            <Flex p={40} align='flex-end' justify='center'>
                <Loader />
            </Flex>
        );
    }

    const mainFields = form.getValues().mainContacts.map((item, index) => (
        <Flex key={randomId()} direction='column' gap='xl'>
            <GeneralInput index={index} name='contact' prefix='mainContacts' label={item.contact.label ?? ''} />
            <CheckboxInput
                // disabled={
                //     form.getValues().mainContacts[0].contact.is_preferred ||
                //     form.getValues().mainContacts[1].contact.is_preferred ||
                //     form.getValues().mainContacts[2].contact.is_preferred
                // }
                prefix='mainContacts'
                index={index}
                name='contact'
                label='Желаемый вид связи'
            />
        </Flex>
    ));

    const additionalFields = form.getValues().additionalContacts.map((item, index) => (
        <Flex key={randomId()} direction='column' gap='xl'>
            <GeneralInput index={index} name='contact' prefix='additionalContacts' label={item.contact.label ?? ''} />
        </Flex>
    ));

    return (
        <CabinetLayout>
            <UserContactsFormProvider form={form}>
                <FormContainer id='user-education-form' onSubmit={onSubmit}>
                    <Flex w={650} direction='column' gap={20}>
                        <Flex w={420} direction='column'>
                            <FormCategoryName title='Основные' />
                            <Flex direction='column' gap={20}>
                                {mainFields}
                            </Flex>
                        </Flex>
                        <Flex w={420} direction='column' pt={20}>
                            <FormCategoryName title='Дополнительные' />
                            <Flex direction='column' gap={20}>
                                {additionalFields}
                            </Flex>
                        </Flex>
                        <Controls />
                    </Flex>
                </FormContainer>
            </UserContactsFormProvider>
        </CabinetLayout>
    );
};
