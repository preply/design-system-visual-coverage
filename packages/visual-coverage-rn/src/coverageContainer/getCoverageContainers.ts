import type { GetContainerData, Logger } from '@preply/ds-visual-coverage-core';

import type { ViewMeasurement, ViewMeasurements } from '../types';

type Params = {
    logger: Logger;
    viewMeasurements: ViewMeasurements;
    getContainerData: GetContainerData<ViewMeasurement>;
};

type Return = ViewMeasurements;

export function getCoverageContainers(params: Params): Return {
    const { logger, getContainerData, viewMeasurements: mutableViewMeasurements } = params;

    const result: Return = [];

    for (let i = 0, n = mutableViewMeasurements.length; i < n; i++) {
        const viewMeasurement = mutableViewMeasurements[i];

        if (!viewMeasurement) {
            throw new Error(`No viewMeasurement at ${i} (this should be a TS-only protection)`);
        }

        const getContainerDataResult = getContainerData({
            component: viewMeasurement,
        });

        if (getContainerDataResult.result === 'ignoreCoverageContainer') {
            continue;
        } else if (getContainerDataResult.result === 'isCoverageContainer') {
            result.push(viewMeasurement);
        }

        result.push(
            ...getCoverageContainers({
                logger,
                getContainerData,
                viewMeasurements: viewMeasurement.children,
            }),
        );
    }

    return result;
}
