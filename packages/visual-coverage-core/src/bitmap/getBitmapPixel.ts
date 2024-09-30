import type { Bitmap, Pixel } from '../types';

import { isPixel } from './isPixel';

export function getBitmapPixel(params: {
    top: number;
    left: number;
    width: number;
    bitmap: Bitmap;
}): Pixel {
    const { top, left, width, bitmap } = params;
    const value = bitmap[top * width + left];

    if (isPixel(value)) return value;

    // This is a TypeScript-only protection (that should be unnecessary with TS 5.5)
    throw new Error(`Invalid pixel value: ${value} (this should be a TS-only protection)`);
}
