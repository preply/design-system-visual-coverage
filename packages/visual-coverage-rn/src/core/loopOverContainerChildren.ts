import type { ChildData, Logger, Milliseconds } from '@preply/ds-visual-coverage-core';
import { createRect, getComponentType } from '@preply/ds-visual-coverage-core';

import { hasCoverageContainerAccessibilityIdentifier } from '../coverageContainer/hasCoverageContainerAccessibilityIdentifier';
import { parseDsComponentAccessibilityIdentifier } from '../coverageContainer/parseDsComponentAccessibilityIdentifier';
import type { ViewMeasurements } from '../types';

type Params = {
    logger: Logger;
    children: ViewMeasurements;

    // Must NOT be passed externally
    recursiveParams?: {
        childrenData: ChildData[];
        isChildOfUiDsComponent: boolean;
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
        recursiveParams: { childrenData, isChildOfUiDsComponent } = {
            childrenData: [],
            isChildOfUiDsComponent: false,
        },
    } = params;

    const start: Milliseconds = Date.now();

    for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if (!child) throw new Error(`No child at ${i} (this should be a TS-only protection)`);

        // Stop when encounter other containers.
        if (hasCoverageContainerAccessibilityIdentifier(child)) continue;

        const dsComponentName = parseDsComponentAccessibilityIdentifier(
            child.accessibilityIdentifier,
        );
        const dsComponentType = getComponentType(dsComponentName);
        const isUiDsComponent = dsComponentType === 'uiDsComponent';

        childrenData.push({
            dsComponentName: dsComponentType === 'nonDsComponent' ? null : dsComponentName,
            isChildOfUiDsComponent,
            dsComponentType,
            rect: createRect({
                top: child.top,
                left: child.left,
                width: child.width,
                height: child.height,
            }),
            componentData: child.accessibilityIdentifier,
        });

        loopOverContainerChildren({
            logger,
            children: child.children,
            recursiveParams: {
                childrenData,
                isChildOfUiDsComponent: isUiDsComponent || isChildOfUiDsComponent,
            },
        });
    }

    return {
        childrenData,
        duration: Date.now() - start,
    };
}
