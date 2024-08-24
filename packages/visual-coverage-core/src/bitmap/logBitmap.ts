import type { Bitmap, Logger } from '../types';

import { getReadableBitmap } from './getReadableBitmap';

export function logBitmap(params: { width: number; logger: Logger; bitmap: Bitmap }): void {
    const { width, logger, bitmap } = params;

    logger(getReadableBitmap({ width, bitmap }));
}
