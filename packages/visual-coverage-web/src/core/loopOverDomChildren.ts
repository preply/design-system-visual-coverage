import type { ChildData, Logger, Milliseconds } from '@preply/ds-visual-coverage-core';
import { createRect, getComponentType } from '@preply/ds-visual-coverage-core';

import { hasCoverageContainerAttribute } from '../coverageContainer/hasCoverageContainerAttribute';
import { DsVisualCoverageError } from '../debug/DsVisualCoverageError';
import type { IdleDeadline, RequestIdleCallback } from '../support/getRequestIdleCallback';
import type { OnError } from '../types';
import { createPromise } from '../utils/createPromise';

import { singleStepTimeout } from './constants';

type LoopParams = {
    logger: Logger;
    onError: OnError;
    domElement: Element;
    deadline: IdleDeadline;
    requestIdleCallbackFunc: RequestIdleCallback;
    stopVisualCoverageCalculation: () => boolean;
    onComplete: (loopOverDomChildrenResult: LoopOverDomChildrenResult) => void;

    // Must NOT be passed externally
    recursiveParams?: {
        loops: Array<LoopData>;
        mutableChildrenData: ChildData[];
        isChildOfUiDsComponent: boolean;
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
        requestIdleCallbackFunc,
        stopVisualCoverageCalculation,
        recursiveParams: { mutableChildrenData, isChildOfUiDsComponent, loops } = {
            loops: [{ i: 0 }],
            mutableChildrenData: [],
            isChildOfUiDsComponent: false,
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
            logger('⏳ Waiting idle');
            requestIdleCallbackFunc((nextCallbackDeadline: IdleDeadline) => {
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
                    requestIdleCallbackFunc,
                    stopVisualCoverageCalculation,
                    deadline: nextCallbackDeadline,

                    recursiveParams: {
                        loops,
                        mutableChildrenData,
                        isChildOfUiDsComponent,
                    },
                });
            });
            return;
        }

        try {
            const child = domElement.children[i];

            if (!child) throw new Error(`No child at ${i} (this should be a TS-only protection)`);
            if (child.nodeType !== Node.ELEMENT_NODE) continue;

            // Because of the asynchronous nature of the algorithm, DOM elements can be removed
            // while the algorithm is running. The final count could be less precise, but cancelling the
            // calculation would mean tracking no events for pages with frequent changes. And given
            // the fact that less calculation events will make the page less important in the final
            // coverage averages, it's better to have an imprecise result compared to no result at all.
            if (!globalThis.document.contains(child)) continue;

            // Stop when encounter other containers.
            if (hasCoverageContainerAttribute(child)) continue;

            if (child.tagName === 'iframe') continue;

            const computedStyle = globalThis.getComputedStyle(child);
            const isInvisible =
                computedStyle.display === 'none' ||
                computedStyle.opacity === '0' ||
                computedStyle.visibility === 'hidden';
            if (isInvisible) continue;

            const dsComponentAttribute = child.getAttribute('data-preply-ds-component');
            const dsComponentType = getComponentType(dsComponentAttribute);
            const isUiDsComponent = dsComponentType === 'uiDsComponent';

            const scrollingFulRect = child.getBoundingClientRect();
            const scrollingFreeRect = {
                width: scrollingFulRect.width,
                height: scrollingFulRect.height,
                top: scrollingFulRect.top + globalThis.scrollY,
                left: scrollingFulRect.left + globalThis.scrollX,
            };

            let startTagWithAttributes = 'unableToParseTag';
            const splitHtml = child.outerHTML.split('>');
            if (splitHtml.length > 0) startTagWithAttributes = child.outerHTML.split('>')[0] + '>';

            mutableChildrenData.push({
                dsComponentType,
                isChildOfUiDsComponent,
                dsComponentName: dsComponentType === 'nonDsComponent' ? null : dsComponentAttribute,
                rect: createRect(scrollingFreeRect),
                componentData: startTagWithAttributes,
            });

            if (child.tagName === 'svg') continue;

            loops.push({ i: 0 });
            nonBlockingLoopOverDomChildren({
                logger,
                onError,
                deadline,
                onComplete,
                domElement: child,
                requestIdleCallbackFunc,
                stopVisualCoverageCalculation,
                recursiveParams: {
                    loops,
                    mutableChildrenData,
                    isChildOfUiDsComponent: isUiDsComponent || isChildOfUiDsComponent,
                },
            });
        } catch (e) {
            onError(e as DsVisualCoverageError);
        }
    }

    if (isRootLoop) {
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
    requestIdleCallbackFunc: RequestIdleCallback;
    stopVisualCoverageCalculation: () => boolean;
};

export function loopOverDomChildren(params: Params): Promise<LoopOverDomChildrenResult> {
    const { logger, domElement, requestIdleCallbackFunc, stopVisualCoverageCalculation } = params;
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
            requestIdleCallbackFunc,
            onError: rejectPromise,
            onComplete: resolvePromise,
            stopVisualCoverageCalculation: internalStopVisualCoverageCalculation,
        });
    });

    return promise;
}
