import type { Logger } from '@preply/ds-visual-coverage-core';

import type { ShouldIgnoreContainer, ViewMeasurements } from '../types';

import { hasCoverageContainerAccessibilityIdentifier } from './hasCoverageContainerAccessibilityIdentifier';
import { parseCoverageContainerAccessibilityIdentifier } from './parseCoverageContainerAccessibilityIdentifier';

type Params = {
    logger: Logger;
    viewMeasurements: ViewMeasurements;
    shouldIgnoreContainer: ShouldIgnoreContainer;
};

type Return = ViewMeasurements;

export function getCoverageContainers(params: Params): Return {
    const { logger, shouldIgnoreContainer, viewMeasurements: mutableViewMeasurements } = params;

    const result: Return = [];

    for (let i = 0, n = mutableViewMeasurements.length; i < n; i++) {
        const viewMeasurement = mutableViewMeasurements[i];

        if (!viewMeasurement) {
            throw new Error(`No viewMeasurement at ${i} (this should be a TS-only protection)`);
        }

        if (hasCoverageContainerAccessibilityIdentifier(viewMeasurement)) {
            const coverageContainer = parseCoverageContainerAccessibilityIdentifier(
                viewMeasurement.accessibilityIdentifier,
            );

            if (shouldIgnoreContainer(coverageContainer)) {
                logger('Ignoring element', coverageContainer.component, coverageContainer.team);
            } else {
                result.push(viewMeasurement);
            }
        }

        result.push(
            ...getCoverageContainers({
                logger,
                shouldIgnoreContainer,
                viewMeasurements: viewMeasurement.children,
            }),
        );
    }

    return result;
}
