import {
    createPixelCounts,
    getRectCoordinate,
    isActiveLogger,
} from '@preply/ds-visual-coverage-core';
import type {
    ChildData,
    Logger,
    Milliseconds,
    PixelCounts,
    Rect,
    WeightByComponentName,
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
    printAsciiArt: boolean;
    childrenData: ChildData[];
    weightByComponentName: WeightByComponentName;
};

export function countPixels(params: Params): Promise<CountPixelsResult> {
    const { logger, elementRect, childrenData, printAsciiArt, weightByComponentName } = params;
    const start: Milliseconds = Date.now();
    let stopped = false;

    const { promise, resolver, rejecter } = createPromise<CountPixelsResult>();

    function onTimeout() {
        stopped = true;
        resolver({
            stopped: true,
            stopReason: 'timeout',
            pixelCounts: createPixelCounts(),
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
            } else {
                resolver({
                    stopped: false,
                    duration: Date.now() - start,
                    pixelCounts: event.data.data.pixelCounts,
                });
            }
            worker.terminate();
        };

        const createCountPixelsWorkerParams: CreateCountPixelsWorkerParams = {
            elementRect,
            childrenData,
            printAsciiArt,
            weightByComponentName,
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
