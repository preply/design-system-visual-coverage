import type { HighestNumber, PixelCounts } from '../types';

export function createPixelCounts(): PixelCounts {
    const length: HighestNumber = 8;
    const pixelCounts = new Uint32Array(length + 1);

    return pixelCounts;
}
