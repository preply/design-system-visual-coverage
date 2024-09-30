import type { Bitmap } from '../types';

export function createBitmap(width: number, height: number): Bitmap {
    const bitmap: Bitmap = new Uint8Array(Math.floor(width) * Math.floor(height));

    return bitmap;
}
