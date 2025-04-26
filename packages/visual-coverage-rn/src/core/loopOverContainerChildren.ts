import type {
    Logger,
    ChildData,
    Milliseconds,
    GetComponentData,
    GetContainerData,
} from '@preply/ds-visual-coverage-core';
import { createRect } from '@preply/ds-visual-coverage-core';

import type { ViewMeasurement, ViewMeasurements } from '../types';

type Params = {
    logger: Logger;
    children: ViewMeasurements;
    coverageContainerData: ChildData;
    getContainerData: GetContainerData<ViewMeasurement>;
    getComponentData: GetComponentData<ViewMeasurement>;

    // Must NOT be passed externally
    recursiveParams?: {
        childrenData: ChildData[];
        parentsData: ChildData[];
    };
};

type LoopOverContainerChildrenResult = {
    childrenData: ChildData[];
    duration: Milliseconds;
};

export function loopOverContainerChildren(params: Params): LoopOverContainerChildrenResult {
    const {
        logger,
        children,
        getContainerData,
        getComponentData,
        coverageContainerData,
        recursiveParams: { childrenData, parentsData } = {
            childrenData: [],
            parentsData: [coverageContainerData],
        },
    } = params;

    const start: Milliseconds = Date.now();

    for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if (!child) throw new Error(`No child at ${i} (this should be a TS-only protection)`);

        // Stop when encounter other containers.
        const getContainerDataResult = getContainerData({ component: child });
        const coverageContainerFound =
            getContainerDataResult.result === 'ignoreCoverageContainer' ||
            getContainerDataResult.result === 'isCoverageContainer';

        if (coverageContainerFound) continue;

        const getComponentDataResult = getComponentData({
            component: child,
            parentsData,
        });

        if (getComponentDataResult.result === 'ignoreComponent') continue;

        const { weight, dsComponentName, debugInfo, debugColor } = getComponentDataResult;

        const rect = createRect({
            top: child.top,
            left: child.left,
            width: child.width,
            height: child.height,
        });

        const childData: ChildData = {
            rect,
            weight,
            debugInfo,
            debugColor,
            dsComponentName,
        };

        childrenData.push(childData);
        parentsData.push(childData);

        loopOverContainerChildren({
            logger,
            getContainerData,
            getComponentData,
            coverageContainerData,
            children: child.children,
            recursiveParams: {
                childrenData,
                parentsData,
            },
        });
        parentsData.pop();
    }

    return {
        childrenData,
        duration: Date.now() - start,
    };
}
