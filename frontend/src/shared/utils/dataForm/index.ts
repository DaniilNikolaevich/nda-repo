import { isNull } from 'lodash-es';

export const dataForm = ({ file, name }: { file: Blob | string; name: string }) => {
    const formData = new FormData();
    formData.append(name, file);
    return formData;
};

export const dataFormObject = <T>(values: object) => {
    const formData = new FormData();
    (Object.keys(values) as Array<keyof typeof values>).forEach((key) => {
        !isNull(values[key]) && formData.append(key, values[key] as typeof key);
    });

    return formData;
};
