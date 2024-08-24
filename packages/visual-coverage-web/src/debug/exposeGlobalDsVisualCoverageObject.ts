import type { ColorByPixelType, WeightByComponentName } from '@preply/ds-visual-coverage-core';
import {
    defaultColorByPixelType,
    defaultWeightByComponentName,
} from '@preply/ds-visual-coverage-core';

import { createCalculateDsVisualCoverages } from '../createCalculateDsVisualCoverages';
import { alertResult } from '../debug/alertResult';
import { isRunAndAlertParamSet, isVisualizeQueryParamSet } from '../debug/queryParams';
import type { OnComplete, OnError } from '../types';

import { removeSvgRenderers } from './removeSvgRenderers';

export function exposeGlobalDsVisualCoverageObject(): void {
    if (globalThis.__PREPLY_DS_COVERAGE) {
        // Already run
        return;
    }

    const { run } = createCalculateDsVisualCoverages({
        log: false,
        printAsciiArt: false,
        userType: 'anonymous',
        drawAndAppendSvg: false,
    });
    const { run: runAndLog } = createCalculateDsVisualCoverages({
        log: true,
        printAsciiArt: false,
        userType: 'anonymous',
        drawAndAppendSvg: false,
    });
    const { run: runAndVisualize } = createCalculateDsVisualCoverages({
        log: true,
        printAsciiArt: false,
        userType: 'anonymous',
        drawAndAppendSvg: true,
        svgContainer: globalThis.document.body,
    });

    const exposedFunctions = {
        createCalculateDsVisualCoverages,

        run: (onComplete?: OnComplete, onError?: OnError) =>
            run({
                onComplete: (...args) => {
                    console.info(...args);
                    onComplete?.(...args);
                },
                onError: (...args) => {
                    console.error(...args);
                    onError?.(...args);
                },
            }),
        runAndLog: (onComplete?: OnComplete, onError?: OnError) =>
            runAndLog({
                onComplete: (...args) => {
                    console.info(...args);
                    onComplete?.(...args);
                },
                onError: (...args) => {
                    console.error(...args);
                    onError?.(...args);
                },
            }),
        runAndVisualize: (onComplete?: OnComplete, onError?: OnError) => {
            removeSvgRenderers();
            return runAndVisualize({
                onComplete: (...args) => {
                    console.info(...args);
                    onComplete?.(...args);
                },
                onError: (...args) => {
                    console.error(...args);
                    onError?.(...args);
                },
            });
        },
        runAndVisualizeContainer: (
            componentName: string,
            onComplete?: OnComplete,
            onError?: OnError,
        ) => {
            removeSvgRenderers();

            return createCalculateDsVisualCoverages({
                log: true,
                printAsciiArt: false,
                userType: 'anonymous',
                drawAndAppendSvg: true,
                svgContainer: globalThis.document.body,

                shouldIgnoreContainer: container => container.component !== componentName,
            }).run({
                onComplete: (...args) => {
                    console.info(...args);
                    onComplete?.(...args);
                },
                onError: (...args) => {
                    console.error(...args);
                    onError?.(...args);
                },
            });
        },
        runToCheckMemoryLeaks: () => {
            console.info(
                'Calculate the DS coverage every 1000 ms (without logging the result to avoid the console referencing the result and causing memory leaks)',
            );
            setInterval(() => {
                run({
                    onComplete: () => console.info('Count completed'),
                    onError: () => console.error,
                });
            }, 1000);
        },
        playWithWeightsAndColors: (
            weightByComponentName: WeightByComponentName = defaultWeightByComponentName,
            colorByPixelType: ColorByPixelType = defaultColorByPixelType,
        ) => {
            console.info(
                'Sets the data-preply-ds-coverage attribute to document.body, run the coverage, and append some SVGs to show the result',
            );

            removeSvgRenderers();

            const calculateDsVisualCoverages = createCalculateDsVisualCoverages({
                log: true,
                colorByPixelType,
                printAsciiArt: true,
                weightByComponentName,
                userType: 'anonymous',
                drawAndAppendSvg: true,

                svgContainer: globalThis.document.body,
            });

            calculateDsVisualCoverages.run({
                onComplete: dsVisualCoverageRunResult => {
                    console.info(dsVisualCoverageRunResult);
                },
                onError: (...args) => {
                    console.error(...args);
                },
            });
        },
        reset: () => {
            removeSvgRenderers();
        },
    };

    globalThis.__PREPLY_DS_COVERAGE = exposedFunctions;

    const forceRunAndAlert = isRunAndAlertParamSet(window.location.search);
    const forceVisualize = isVisualizeQueryParamSet(window.location.search);

    const defaultCheckInterval = 500;

    // This is especially useful to show the result on mobile devices where accessing the browser's console is not always possible
    if (forceRunAndAlert) {
        console.info(
            `In ${defaultCheckInterval} ms, the coverage is calculated and the result alerted`,
        );
        setTimeout(() => {
            run({
                onComplete: ({ dsVisualCoverageResults }) => {
                    dsVisualCoverageResults.forEach(r => {
                        alertResult({
                            coverage: r.coverage,
                            blockingDuration: r.duration.blockingDuration,
                            nonBlockingDuration: r.duration.nonBlockingDuration,
                            component: r.component,
                        });
                    });
                },
                onError: () => console.error,
            });
        }, defaultCheckInterval);
    }

    if (forceVisualize) {
        console.info(`In ${defaultCheckInterval} ms, the coverage is calculated, and shown`);
        setTimeout(
            () => runAndVisualize({ onError: () => console.error, onComplete: () => console.info }),
            defaultCheckInterval,
        );
    }
}
