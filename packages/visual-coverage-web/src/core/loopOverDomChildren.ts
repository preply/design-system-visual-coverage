import type {
    Logger,
    ChildData,
    Milliseconds,
    GetComponentData,
    DsVisualCoverageError,
} from '@preply/ds-visual-coverage-core';
import { createRect } from '@preply/ds-visual-coverage-core';

import type { IdleDeadline, RequestIdleCallback } from '../support/getRequestIdleCallback';
import type { CoverageContainerDataAttribute, OnError } from '../types';
import { createPromise } from '../utils/createPromise';

import { singleStepTimeout } from './constants';

type LoopParams = {
    logger: Logger;
    onError: OnError;
    domElement: Element;
    deadline: IdleDeadline;
    coverageContainerData: ChildData;
    requestIdleCallbackFunc: RequestIdleCallback;
    stopVisualCoverageCalculation: () => boolean;
    onComplete: (loopOverDomChildrenResult: LoopOverDomChildrenResult) => void;
    coverageContainersDataAttribute: CoverageContainerDataAttribute | undefined;
    getComponentData: GetComponentData<Element>;

    // Must NOT be passed externally
    recursiveParams?: {
        loops: Array<LoopData>;
        parentsData: ChildData[];
        mutableChildrenData: ChildData[];
        pendingCallbackIds: Set<number>;
    };
};

type LoopOverDomChildrenResult = {
    childrenData: ChildData[];
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

export type StopReason = 'timeout' | 'userClick' | 'externalStop' | 'navigationChange';

type LoopData = {
    i: number;
};

function nonBlockingLoopOverDomChildren(params: LoopParams): void {
    const {
        logger,
        onError,
        deadline,
        domElement,
        onComplete,
        getComponentData,
        coverageContainerData,
        requestIdleCallbackFunc,
        stopVisualCoverageCalculation,
        coverageContainersDataAttribute,
        recursiveParams: { mutableChildrenData, loops, parentsData, pendingCallbackIds } = {
            loops: [{ i: 0 }],
            mutableChildrenData: [],
            parentsData: [coverageContainerData],
            pendingCallbackIds: new Set<number>(),
        },
    } = params;

    const currentLoop = loops[loops.length - 1];
    if (currentLoop === undefined) {
        throw new Error(`No loop at ${loops.length - 1} (this should be a TS-only protection)`);
    }

    const isRootLoop = loops.length === 1;
    const start: Milliseconds = isRootLoop ? Date.now() : -1;

    if (stopVisualCoverageCalculation()) {
        onComplete({
            stopped: true,
            stopReason: 'externalStop',
            childrenData: mutableChildrenData,
        });
        return;
    }

    for (let { i } = currentLoop; i < domElement.children.length; i++) {
        if (deadline.timeRemaining() <= 0) {
            logger.log('⏳ Waiting idle');
            const callbackId = requestIdleCallbackFunc((nextCallbackDeadline: IdleDeadline) => {
                pendingCallbackIds.delete(callbackId);

                if (stopVisualCoverageCalculation()) {
                    onComplete({
                        stopped: true,
                        stopReason: 'externalStop',
                        childrenData: mutableChildrenData,
                    });
                    return;
                }

                nonBlockingLoopOverDomChildren({
                    logger,
                    onError,
                    domElement,
                    onComplete,
                    getComponentData,
                    coverageContainerData,
                    requestIdleCallbackFunc,
                    stopVisualCoverageCalculation,
                    deadline: nextCallbackDeadline,
                    coverageContainersDataAttribute,

                    recursiveParams: {
                        loops,
                        parentsData,
                        mutableChildrenData,
                        pendingCallbackIds,
                    },
                });
            });
            pendingCallbackIds.add(callbackId);
            return;
        }

        try {
            const child = domElement.children[i];

            if (!child) throw new Error(`No child at ${i} (this should be a TS-only protection)`);
            if (child.nodeType !== Node.ELEMENT_NODE) continue;

            // Stop when encounter other containers.
            if (child.matches(`[${coverageContainersDataAttribute}]`)) continue;

            const scrollingFulRect = child.getBoundingClientRect();
            const scrollingFreeRect = {
                width: scrollingFulRect.width,
                height: scrollingFulRect.height,
                top: scrollingFulRect.top + globalThis.scrollY,
                left: scrollingFulRect.left + globalThis.scrollX,
            };

            const rect = createRect(scrollingFreeRect);

            const getComponentDataResult = getComponentData({
                component: child,
                parentsData,
            });

            if (getComponentDataResult.result === 'ignoreComponent') continue;

            const { weight, dsComponentName, debugInfo, debugColor } = getComponentDataResult;
            const childData: ChildData = {
                rect,
                weight,
                debugInfo,
                debugColor,
                dsComponentName,
            };

            mutableChildrenData.push(childData);

            if (child.tagName === 'svg') continue;

            loops.push({ i: 0 });
            parentsData.push(childData);
            nonBlockingLoopOverDomChildren({
                logger,
                onError,
                deadline,
                onComplete,
                getComponentData,
                domElement: child,
                coverageContainerData,
                requestIdleCallbackFunc,
                stopVisualCoverageCalculation,
                coverageContainersDataAttribute,
                recursiveParams: {
                    loops,
                    parentsData,
                    mutableChildrenData,
                    pendingCallbackIds,
                },
            });
            parentsData.pop();
        } catch (e) {
            onError(e as DsVisualCoverageError);
        }
    }

    if (isRootLoop) {
        // Cancel all pending idle callbacks to prevent race conditions
        pendingCallbackIds.forEach(callbackId => {
            globalThis.cancelIdleCallback(callbackId);
        });

        onComplete({
            stopped: false,
            childrenData: mutableChildrenData,
            duration: isRootLoop ? Date.now() - start : -1,
        });
    } else {
        loops.pop();
    }
}

type Params = {
    logger: Logger;
    domElement: Element;
    coverageContainerData: ChildData;
    getComponentData: GetComponentData<Element>;
    requestIdleCallbackFunc: RequestIdleCallback;
    stopVisualCoverageCalculation: () => boolean;
    coverageContainersDataAttribute: CoverageContainerDataAttribute | undefined;
};

export function loopOverDomChildren(params: Params): Promise<LoopOverDomChildrenResult> {
    const {
        logger,
        domElement,
        getComponentData,
        coverageContainerData,
        requestIdleCallbackFunc,
        stopVisualCoverageCalculation,
        coverageContainersDataAttribute,
    } = params;
    const { promise, resolver, rejecter } = createPromise<LoopOverDomChildrenResult>();
    let resolved = false;
    let stopped = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function resolvePromise(loopOverDomChildrenResult: LoopOverDomChildrenResult) {
        // The recursive call can call onComplete more than once
        if (resolved) return;

        resolved = true;
        resolver(loopOverDomChildrenResult);
    }
    function rejectPromise(error: unknown) {
        removeListeners();

        // The recursive call can call onComplete more than once
        if (resolved) return;

        resolved = true;
        rejecter(error);
    }

    // --------------------------------------------------
    // Internal DOM calculation stop
    // --------------------------------------------------
    function internalStopVisualCoverageCalculation() {
        if (stopped) {
            removeListeners();
            return true;
        }

        return stopVisualCoverageCalculation();
    }

    function onNavigationChange() {
        removeListeners();

        stopped = true;
        resolvePromise({
            stopped: true,
            stopReason: 'navigationChange',
            childrenData: [],
        });
    }

    function onClick() {
        removeListeners();

        stopped = true;
        resolvePromise({
            stopped: true,
            stopReason: 'userClick',
            childrenData: [],
        });
    }

    function onTimeout() {
        removeListeners();

        stopped = true;
        resolvePromise({
            stopped: true,
            stopReason: 'timeout',
            childrenData: [],
        });
    }

    function addListeners() {
        // Kills the process if it takes too long
        timeoutId = setTimeout(onTimeout, singleStepTimeout);
        // All the events that could change the DOM in the middle of the calculation
        globalThis.addEventListener('popstate', onNavigationChange);
        globalThis.document.addEventListener('click', onClick);
    }
    function removeListeners() {
        clearTimeout(timeoutId);
        globalThis.removeEventListener('popstate', onNavigationChange); // Clean up listener
        globalThis.document.removeEventListener('click', onClick); // Clean up listener
    }
    // --------------------------------------------------
    // --------------------------------------------------

    requestIdleCallbackFunc((deadline: IdleDeadline) => {
        addListeners();
        nonBlockingLoopOverDomChildren({
            logger,
            deadline,
            domElement,
            getComponentData,
            coverageContainerData,
            requestIdleCallbackFunc,
            onError: rejectPromise,
            onComplete: resolvePromise,
            coverageContainersDataAttribute,
            stopVisualCoverageCalculation: internalStopVisualCoverageCalculation,
        });
    });

    return promise;
}
