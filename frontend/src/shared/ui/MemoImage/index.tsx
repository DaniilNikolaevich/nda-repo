import { memo } from 'react';
import { Image } from '@mantine/core';
import NextImage, { ImageProps } from 'next/image';

export const MemoImage = memo(({ src }: ImageProps) => (
    <Image radius='var(--size-md)' alt='image' component={NextImage} src={src} width={870} height={420} />
));

MemoImage.displayName = 'MemoImage';
