import { memo } from 'react';
import { Image } from '@mantine/core';
import NextImage, { ImageProps } from 'next/image';

export const MemoImage = memo(({ src, w, width = 870, height = 420 }: ImageProps & { w?: number | string }) => (
    <Image
        radius='var(--size-md)'
        alt='image'
        component={NextImage}
        w={w ?? width}
        h={height ?? '100%'}
        src={src}
        width={width}
        height={height}
    />
));

MemoImage.displayName = 'MemoImage';
