import { createLogger } from '@preply/ds-visual-coverage-core';
import type { GetContainerData, GetComponentData } from '@preply/ds-visual-coverage-core';

import { calculateDsVisualCoverages } from './calculateDsVisualCoverages';
import { getRequestIdleCallback } from './support/getRequestIdleCallback';
import type { CoverageContainerDataAttribute, OnComplete, OnError } from './types';

type Params = {
    log: boolean;
    getComponentData: GetComponentData<Element>;
    rootElement?: HTMLElement;
} & (
    | {
          getContainerData?: never;
          coverageContainersDataAttribute?: never;
      }
    | {
          getContainerData: GetContainerData<Element>;
          coverageContainersDataAttribute: CoverageContainerDataAttribute;
      }
);

type Result = {
    run: (params: { onError: OnError; onComplete: OnComplete }) => void;
    cancel: () => void;
};

export function createCalculateDsVisualCoverages(params: Params): Result {
    const {
        log,
        getComponentData,
        getContainerData,
        coverageContainersDataAttribute,
        rootElement = globalThis.document.body,
    } = params;

    let canceled = false;
    const stopVisualCoverageCalculation = () => canceled;

    const logger = createLogger(log);

    function run({ onError, onComplete }: { onError: OnError; onComplete: OnComplete }) {
        calculateDsVisualCoverages({
            logger,
            onError,
            onComplete,
            rootElement,
            getComponentData,
            getContainerData,
            stopVisualCoverageCalculation,
            coverageContainersDataAttribute,
            requestIdleCallbackFunc: getRequestIdleCallback(),
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
