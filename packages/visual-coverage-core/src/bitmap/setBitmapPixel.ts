import type { Bitmap, Pixel } from '../types';

export function setBitmapPixel(params: {
    top: number;
    left: number;
    width: number;
    value: Pixel;
    bitmap: Bitmap;
}): void {
    const { top, left, width, value, bitmap } = params;

    bitmap[top * width + left] = value;
}
