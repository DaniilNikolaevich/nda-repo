export const extractUrl = (url: string) => {
    const { protocol, hostname } = new URL(url);

    return `${protocol}${hostname}`;
};
