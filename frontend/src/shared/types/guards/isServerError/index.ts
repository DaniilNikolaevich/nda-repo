import { isObject } from 'lodash-es';

export function isServerError(res: unknown): res is { data: { message: string } } {
    return isObject(res) && 'data' in res && isObject(res.data) && 'message' in res.data;
}

export function isErrorWithMessage(res: unknown): res is { message: string } {
    return isObject(res) && 'message' in res;
}
