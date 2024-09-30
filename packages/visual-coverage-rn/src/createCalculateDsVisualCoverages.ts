import {
    ColorByPixelType,
    PixelByPixelType,
    WeightByComponentName,
    createLogger,
    defaultColorByPixelType,
    defaultWeightByComponentName,
} from '@preply/ds-visual-coverage-core';
import { defaultPixelByPixelType } from '@preply/ds-visual-coverage-core/dist/core/constants';

import { calculateDsVisualCoverages } from './calculateDsVisualCoverages';
import { defaultShouldIgnoreContainer } from './core/constants';
import type { OnComplete, OnError, RootSwiftView, ShouldIgnoreContainer } from './types';

type Params = {
    log: boolean;
    printAsciiArt: boolean;
    pixelByPixelType?: PixelByPixelType;
    colorByPixelType?: ColorByPixelType;
    weightByComponentName?: WeightByComponentName;
    shouldIgnoreContainer?: ShouldIgnoreContainer;
    stopVisualCoverageCalculation: () => boolean;
};

type Result = {
    run: (params: {
        onError: OnError;
        onComplete: OnComplete;
        rootSwiftView: RootSwiftView;
    }) => void;
    cancel: () => void;
};

export function createCalculateDsVisualCoverages(params: Params): Result {
    const {
        log,
        printAsciiArt,
        colorByPixelType = defaultColorByPixelType,
        pixelByPixelType = defaultPixelByPixelType,
        weightByComponentName = defaultWeightByComponentName,
        shouldIgnoreContainer = defaultShouldIgnoreContainer,
    } = params;
    let canceled = false;
    const stopVisualCoverageCalculation = () => canceled;

    const logger = createLogger(log);

    function run({
        onError,
        onComplete,
        rootSwiftView,
    }: {
        onError: OnError;
        onComplete: OnComplete;
        rootSwiftView: RootSwiftView;
    }) {
        calculateDsVisualCoverages({
            logger,
            onError,

            onComplete,
            printAsciiArt,
            rootSwiftView,
            pixelByPixelType,
            colorByPixelType,
            weightByComponentName,
            shouldIgnoreContainer,
            stopVisualCoverageCalculation,
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
