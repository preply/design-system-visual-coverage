import { defaultReadableCharByPixelType } from '../core/constants';
import type { Bitmap, ReadableCharByPixel } from '../types';

export function getReadableBitmap(params: {
    width: number;
    bitmap: Bitmap;
    readableCharByPixelType?: ReadableCharByPixel;
}): string {
    const { width, bitmap, readableCharByPixelType = defaultReadableCharByPixelType } = params;
    let string = '';

    for (let i = 0; i < bitmap.length; i++) {
        if (i % width === 0) {
            string += '\n';
        }

        const pixelAsNumber = bitmap[i];
        if (pixelAsNumber === undefined) {
            throw new Error(`No pixel at ${i} (this should be a TS-only protection)`);
        }
        const pixel = pixelAsNumber.toString();

        const printedPixel = readableCharByPixelType[pixel];

        string += printedPixel;
    }

    return string;
}
