import type { Pixel } from '../types';

/**
 * @see https://dev.to/noriste/keeping-typescript-type-guards-safe-and-up-to-date-a-simpler-solution-ja3
 */
export function isPixel(value: unknown): value is Pixel {
    return (
        value === 0 ||
        value === 1 ||
        value === 2 ||
        value === 3 ||
        value === 4 ||
        value === 5 ||
        value === 6 ||
        value === 7 ||
        value === 8
    );
}
