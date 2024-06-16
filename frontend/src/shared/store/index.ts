import { SetStateAction, useEffect, useState } from 'react';

type UpdateStoreFunction<T> = (update: Partial<T>) => void;
type StateSetter<T> = (action: SetStateAction<T>) => void;
interface StoreModifier<T> {
    set: StateSetter<T>;
    update: UpdateStoreFunction<T>;
}
type UseStoreFunction<T> = () => [T | undefined, StoreModifier<T>];

const createEmitter = <T>() => {
    const subscriptions = new Map();
    return {
        emit: (store?: T) => subscriptions.forEach((listener) => listener(store)),
        subscribe: (listener: (store: T) => void) => {
            const key = Symbol();
            subscriptions.set(key, listener);
            return () => subscriptions.delete(key);
        },
    };
};

export const createStore = <T>(initialState?: T): [UseStoreFunction<T>, StoreModifier<T>] => {
    let store = initialState;
    const emitter = createEmitter<T>();

    const set: StateSetter<T> = (action) => {
        store = action instanceof Function ? action(store as T) : action;
        emitter.emit(store);
    };

    const update: UpdateStoreFunction<T> = (partial) => {
        store = { ...store, ...partial } as T;
        emitter.emit(store);
    };

    const useStore: UseStoreFunction<T> = () => {
        const [localStore, setLocalStore] = useState(store);
        useEffect(() => {
            emitter.subscribe(setLocalStore);
        }, []);
        return [localStore, { set, update }];
    };

    return [useStore, { set, update }];
};
