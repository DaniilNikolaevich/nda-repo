import { redirect } from 'next/navigation';

export const redirectWithState = (url: string) => {
    redirect(url);
};
