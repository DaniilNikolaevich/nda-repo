import { FileInput } from '@mantine/core';
import { Paperclip } from '@phosphor-icons/react/dist/ssr/Paperclip';

import { useRegistrationFormContext } from '@/components/widgets/RegistrationForm/model';
import { ACCEPTED_FILE_TYPE } from '@/shared/constants';

export const CVInput = () => {
    const { key, getInputProps } = useRegistrationFormContext();

    const icon = <Paperclip />;

    return (
        <FileInput
            accept={ACCEPTED_FILE_TYPE.resume.mediaTypes.join(',')}
            label='Резюме'
            placeholder='Файл'
            rightSection={icon}
            key={key('cv_file')}
            {...getInputProps('cv_file')}
        />
    );
};
