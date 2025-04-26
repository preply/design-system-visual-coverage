import type { PixelCounts } from '../types';

export function createPixelCounts(length: number): PixelCounts {
    const pixelCounts = new Uint32Array(length + 1);

    return pixelCounts;
}
