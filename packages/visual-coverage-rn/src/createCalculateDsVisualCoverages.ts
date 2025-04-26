import { createLogger } from '@preply/ds-visual-coverage-core';
import type { GetContainerData, GetComponentData } from '@preply/ds-visual-coverage-core';

import { calculateDsVisualCoverages } from './calculateDsVisualCoverages';
import type { OnComplete, OnError, RootSwiftView, ViewMeasurement } from './types';

type Params = {
    log: boolean;
    getContainerData: GetContainerData<ViewMeasurement>;
    getComponentData: GetComponentData<ViewMeasurement>;
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
    const { log, getComponentData, getContainerData } = params;
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
            rootSwiftView,
            getComponentData,
            getContainerData,
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
