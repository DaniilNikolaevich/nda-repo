import { nothingToNull } from '@/shared/utils';

export const enum STORAGE_KEYS {
    REFRESH_TOKEN = 'refresh_token',
    TOKEN = 'token',
    USER = 'user',
    CHAT_TOKEN = 'chat',
}

class StorageService {
    public readonly VERSION = '1.0.0-SNAPSHOT';

    private storage = new Map<string, unknown>();

    private readonly getFromStore = <T>(key: string) => {
        const storedObjectWrapperJson = nothingToNull(window.localStorage.getItem(key));

        if (storedObjectWrapperJson) {
            try {
                const storedObjectWrapper = JSON.parse(storedObjectWrapperJson) as {
                    version: string;
                    object: T;
                };

                if (storedObjectWrapper.version !== this.VERSION) {
                    window.localStorage.removeItem(key);
                    return null;
                }
                return storedObjectWrapper.object;
            } catch (error: unknown) {
                return error;
            }
        } else {
            return null;
        }
    };

    private readonly store = <T>(key: string, object: T) =>
        window.localStorage.setItem(key, JSON.stringify(this.createVersionWrapper(object)));

    private createVersionWrapper = <T>(object: T) => ({
        version: this.VERSION,
        object: object,
    });

    public setToken = (token: string): void => {
        window.localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    };

    public setRole = (role: string): void => {
        window.localStorage.setItem(STORAGE_KEYS.USER, role);
    };

    public setRefreshToken = (token: string): void => {
        window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    };

    public setWebSocketToken = (token: string) => {
        window.localStorage.setItem(STORAGE_KEYS.CHAT_TOKEN, token);
    };

    public deleteToken = (): void => {
        window.localStorage.removeItem(STORAGE_KEYS.TOKEN);
    };

    public getToken = (): string | null => {
        if (typeof window !== 'undefined') {
            return window.localStorage.getItem(STORAGE_KEYS.TOKEN);
        }
        return null;
    };

    public getChatToken = (): string | null => {
        if (typeof window === 'undefined') return null;
        return window.localStorage.getItem(STORAGE_KEYS.CHAT_TOKEN);
    };

    public getRole = (): string | null => {
        if (typeof window !== 'undefined') {
            return window.localStorage.getItem(STORAGE_KEYS.USER);
        }
        return null;
    };

    public getRefreshToken = (): string | null => {
        if (typeof window !== 'undefined') {
            return window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        }
        return null;
    };

    public clear = (): void => {
        window.localStorage.clear();
        window.location.assign('/');
    };
}

export const STORAGE = new StorageService();
