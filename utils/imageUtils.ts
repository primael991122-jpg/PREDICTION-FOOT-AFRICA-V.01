
export const getSafeImageUrl = (url: string | undefined, fallback: string = 'https://picsum.photos/seed/placeholder/200'): string => {
    if (!url || url.trim() === '') return fallback;
    return url;
};

export const getFlagUrl = (code: string | undefined): string => {
    if (!code || code.trim() === '') return 'https://flagcdn.com/w20/un.png'; // UN flag as fallback
    return `https://flagcdn.com/w20/${code.toLowerCase()}.png`;
};
