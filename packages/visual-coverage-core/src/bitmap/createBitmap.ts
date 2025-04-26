import type { Bitmap } from '../types';

export function createBitmap(width: number, height: number, highestPixel: number): Bitmap {
    if (highestPixel <= 255) return new Uint8Array(Math.floor(width) * Math.floor(height));

    if (highestPixel <= 65_535) return new Uint16Array(Math.floor(width) * Math.floor(height));

    return new Uint32Array(Math.floor(width) * Math.floor(height));
}
