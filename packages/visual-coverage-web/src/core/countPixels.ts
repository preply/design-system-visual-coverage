import {
    createPixelCounts,
    getRectCoordinate,
    isActiveLogger,
} from '@preply/ds-visual-coverage-core';
import type {
    Bitmap,
    ChildData,
    Logger,
    Milliseconds,
    PixelCounts,
    Rect,
} from '@preply/ds-visual-coverage-core';

import { createPromise } from '../utils/createPromise';

import { singleStepTimeout } from './constants';
import { createCountPixelsWorker } from './createCountPixelsWorker';
import type {
    CountPixelsWorkerEvent,
    Params as CreateCountPixelsWorkerParams,
} from './createCountPixelsWorker';

type CountPixelsResult = {
    pixelCounts: PixelCounts;

    // Tells the consumer what numbers have been used for every component name, useful to
    // post-process the bitmap independently
    pixelByComponentName: Record<string, number>;

    // Tells the consumer what number has been used for the non-DS components pixels, useful to
    // post-process the bitmap independently
    nonDsComponentsPixel: number;

    // It's returned when passed with `returnBitmap: true`
    bitmap: Bitmap | null;
} & (
    | {
          stopped: false;
          duration: Milliseconds;
      }
    | {
          stopped: true;
          stopReason: StopReason;
      }
);

export type StopReason = 'timeout';

type Params = {
    logger: Logger;
    elementRect: Rect;
    // Useful for debugging purposes. Please consider it slows down the serialization process between
    // the threads
    returnBitmap: boolean;
    childrenData: ChildData[];
};

export function countPixels(params: Params): Promise<CountPixelsResult> {
    const { logger, elementRect, childrenData } = params;
    const start: Milliseconds = Date.now();
    let stopped = false;

    const { promise, resolver, rejecter } = createPromise<CountPixelsResult>();

    function onTimeout() {
        stopped = true;
        resolver({
            bitmap: null,
            stopped: true,
            stopReason: 'timeout',
            nonDsComponentsPixel: 0,
            pixelByComponentName: {},
            pixelCounts: createPixelCounts(0),
        });
    }

    const timeoutId = setTimeout(onTimeout, singleStepTimeout);

    try {
        const worker = createCountPixelsWorker();

        worker.onmessage = function onWorkerMessage(event: MessageEvent<CountPixelsWorkerEvent>) {
            clearTimeout(timeoutId);

            if (stopped) return;

            if (event.data.status === 'error') {
                rejecter(event.data.error);
            } else if (event.data.status === 'logOnMainThread') {
                logger.log(event.data.data);
            } else {
                const bitmap = event.data.data.bitmap;
                resolver({
                    stopped: false,
                    duration: Date.now() - start,
                    pixelCounts: event.data.data.pixelCounts,
                    pixelByComponentName: event.data.data.pixelByComponentName,
                    nonDsComponentsPixel: event.data.data.nonDsComponentsPixel,
                    bitmap,
                });
            }
            worker.terminate();
        };

        const createCountPixelsWorkerParams: CreateCountPixelsWorkerParams = {
            elementRect,
            childrenData,
            returnBitmap: false,
            log: isActiveLogger(logger),
            offset: {
                top: getRectCoordinate(elementRect, 'top'),
                left: getRectCoordinate(elementRect, 'left'),
            },
        };

        // Pass the typed array to the worker
        worker.postMessage(createCountPixelsWorkerParams);
    } catch (error) {
        clearTimeout(timeoutId);

        if (!stopped) {
            rejecter(error);
        }
    }

    return promise;
}
