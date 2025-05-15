import type { GetContainerData, Logger } from '@preply/ds-visual-coverage-core';
import { createRect } from '@preply/ds-visual-coverage-core';

import type { CoverageContainerDataAttribute, CoverageContainerData } from '../types';

type Params = {
    logger: Logger;
    rootElement: HTMLElement;
    getContainerData: GetContainerData<Element> | undefined;

    // If not present, the rootElement will be the only coverage container
    coverageContainersDataAttribute: CoverageContainerDataAttribute | undefined;
};

type Return = Array<CoverageContainerData>;

export function getCoverageContainersData(params: Params): Return {
    const { logger, getContainerData, rootElement, coverageContainersDataAttribute } = params;

    const result: Return = [];

    const coverageContainers = coverageContainersDataAttribute
        ? Array.from(rootElement.querySelectorAll(`[${coverageContainersDataAttribute}]`))
        : [rootElement];

    const rootElementIsCoverageContainer =
        coverageContainersDataAttribute &&
        rootElement.hasAttribute(coverageContainersDataAttribute);

    if (rootElementIsCoverageContainer) coverageContainers.unshift(rootElement);

    logger.log(`Found ${coverageContainers.length} coverage containers`);

    for (let i = 0, n = coverageContainers.length; i < n; i++) {
        const domElement = coverageContainers[i];

        if (!domElement)
            throw new Error(`No element at ${i} (this should be a TS-only protection)`);

        const scrollingFulRect = domElement.getBoundingClientRect();
        const scrollingFreeRect = {
            width: scrollingFulRect.width,
            height: scrollingFulRect.height,
            top: scrollingFulRect.top + globalThis.scrollY,
            left: scrollingFulRect.left + globalThis.scrollX,
        };

        const getContainerDataResult = getContainerData
            ? getContainerData({
                  component: domElement,
              })
            : {
                  result: 'isCoverageContainer',
                  coverageContainer: 'rootElement',
              };

        if (getContainerDataResult.result === 'ignoreCoverageContainer') {
            continue;
        } else if (getContainerDataResult.result === 'isNotCoverageContainer') {
            // This use case doesn't really exist. It means that a DOM element has the passed
            // coverage container attribute (otherwise the query would not find it) but the consumer
            // decided that it's not a coverage container.
            continue;
        }

        result.push({
            domElement,
            elementRect: createRect(scrollingFreeRect),
            attributeValue: coverageContainersDataAttribute
                ? domElement.getAttribute(coverageContainersDataAttribute)
                : null,
        });
    }

    return result;
}
