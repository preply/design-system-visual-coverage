import type { Logger } from '@preply/ds-visual-coverage-core';
import { coverageContainerDomAttributeName, createRect } from '@preply/ds-visual-coverage-core';

import type { CoverageContainerData, ShouldIgnoreContainer } from '../types';

import { parseCoverageContainerDomAttribute } from './getCoverageContainerAttributes';

type Params = {
    logger: Logger;
    rootElement: Document | HTMLElement;
    shouldIgnoreContainer: ShouldIgnoreContainer;
};

type Return = Array<CoverageContainerData>;

export function getCoverageContainersData(params: Params): Return {
    const { logger, shouldIgnoreContainer, rootElement } = params;

    const result: Return = [];

    const coverageContainers = rootElement.querySelectorAll(
        `[${coverageContainerDomAttributeName}]`,
    );
    logger(`Found ${coverageContainers.length} coverage containers`);

    for (let i = 0, n = coverageContainers.length; i < n; i++) {
        const domElement = coverageContainers[i];

        if (!domElement)
            throw new Error(`No element at ${i} (this should be a TS-only protection)`);

        const coverageDomAttribute = domElement?.getAttribute(coverageContainerDomAttributeName);

        if (!coverageDomAttribute)
            throw new Error('No element or attribute (this should be a TS-only protection)');

        const parsedCoverageDomAttribute = parseCoverageContainerDomAttribute(
            JSON.parse(coverageDomAttribute),
        );
        if (shouldIgnoreContainer(parsedCoverageDomAttribute)) {
            logger('Ignoring element', domElement);
            continue;
        }

        const scrollingFulRect = domElement.getBoundingClientRect();
        const scrollingFreeRect = {
            width: scrollingFulRect.width,
            height: scrollingFulRect.height,
            top: scrollingFulRect.top + globalThis.scrollY,
            left: scrollingFulRect.left + globalThis.scrollX,
        };

        result.push({
            domElement,
            elementRect: createRect(scrollingFreeRect),
            coverageContainer: parsedCoverageDomAttribute,
            coverageContainerAttributeValue: coverageDomAttribute,
        });
    }

    return result;
}
