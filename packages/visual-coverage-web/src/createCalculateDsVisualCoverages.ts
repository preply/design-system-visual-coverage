import {
    createLogger,
    defaultColorByPixelType,
    defaultWeightByComponentName,
} from '@preply/ds-visual-coverage-core';
import type { ColorByPixelType, WeightByComponentName } from '@preply/ds-visual-coverage-core';

import { calculateDsVisualCoverages } from './calculateDsVisualCoverages';
import { defaultShouldIgnoreContainer } from './core/constants';
import { getRequestIdleCallback } from './support/getRequestIdleCallback';
import type { OnComplete, OnError, ShouldIgnoreContainer } from './types';

type Params = {
    log: boolean;
    userType: string;
    printAsciiArt: boolean;
    rootElement?: Document | HTMLElement;
    colorByPixelType?: ColorByPixelType;
    weightByComponentName?: WeightByComponentName;
    shouldIgnoreContainer?: ShouldIgnoreContainer;
} & (
    | {
          drawAndAppendSvg: false;
      }
    | {
          drawAndAppendSvg: true;
          svgContainer: HTMLElement;
      }
);

type Result = {
    run: (params: { onError: OnError; onComplete: OnComplete }) => void;
    cancel: () => void;
};

export function createCalculateDsVisualCoverages(params: Params): Result {
    const {
        log,
        userType,
        printAsciiArt,
        rootElement = globalThis.document,
        colorByPixelType = defaultColorByPixelType,
        weightByComponentName = defaultWeightByComponentName,
        shouldIgnoreContainer = defaultShouldIgnoreContainer,
    } = params;

    let canceled = false;
    const stopVisualCoverageCalculation = () => canceled;

    const logger = createLogger(log);

    function run({ onError, onComplete }: { onError: OnError; onComplete: OnComplete }) {
        if (params.drawAndAppendSvg) {
            calculateDsVisualCoverages({
                logger,
                onError,
                userType,
                onComplete,
                rootElement,
                printAsciiArt,
                colorByPixelType,
                weightByComponentName,
                shouldIgnoreContainer,
                stopVisualCoverageCalculation,
                requestIdleCallbackFunc: getRequestIdleCallback(),

                drawAndAppendSvg: true,
                svgContainer: params.svgContainer,
            });
            return;
        }

        calculateDsVisualCoverages({
            logger,
            onError,
            userType,
            onComplete,
            rootElement,
            printAsciiArt,
            colorByPixelType,
            weightByComponentName,
            shouldIgnoreContainer,
            stopVisualCoverageCalculation,
            requestIdleCallbackFunc: getRequestIdleCallback(),

            drawAndAppendSvg: false,
        });
    }

    function cancel() {
        canceled = true;
    }

    return {
        run,
        cancel,
    };
}
