export const FILE_SIZES = {
    '1KB': 1024,
    '1MB': 1024 * (this?.['1KB'] ?? 1024),
};

export const MAX_FILE_SIZE = {
    resume: 1024 * 1024,
} as const;
