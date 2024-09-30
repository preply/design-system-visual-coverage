import type { ChildData, Logger, Milliseconds } from '@preply/ds-visual-coverage-core';

import { compareTwoChildren } from './compareTwoChildren';

type Params = {
    logger: Logger;
    childrenData: ChildData[];
};

type FilterOutIntermediateChildrenResult = {
    childrenData: ChildData[];
    duration: Milliseconds;
};

/**
 * App has more intermediate components than Web. On App, the nested
 * React Native views do not impact what the user sees. That's why we need to remove these
 * "transparent" views from the calculation.
 * On Web, instead, a flex-display'ed div nested inside a DS LayoutFlex breaks
 * LayoutFlex's ability to control padding. Hence on Web it's negative to have intermediate components.
 */
export function filterOutIntermediateChildren(params: Params): FilterOutIntermediateChildrenResult {
    const { childrenData } = params;

    const start: Milliseconds = Date.now();

    const filteredChildrenData: ChildData[] = [];

    for (let i = 0; i < childrenData.length; i++) {
        const child = childrenData[i];
        const nextChild = childrenData[i + 1];

        if (!child) throw new Error(`No child at ${i} (this should be a TS-only protection)`);

        if (!nextChild) {
            const prevChild = filteredChildrenData[filteredChildrenData.length - 1];
            if (!prevChild) {
                filteredChildrenData.push(child);
                break;
            }

            const comparison = compareTwoChildren(prevChild, child);
            const lastIntermediateChildCoverLatestDsComponent =
                comparison !== 'bIsEqualToAButBIsNotDsComponentAndAIs';

            if (lastIntermediateChildCoverLatestDsComponent) filteredChildrenData.push(child);

            break;
        }

        const comparison = compareTwoChildren(child, nextChild);
        const isIntermediateChild =
            comparison === 'bAndAAreEqualNonDsComponents' ||
            comparison === 'bIsEqualToAButBIsDsComponentAndAIsNot';

        if (isIntermediateChild) continue;

        filteredChildrenData.push(child);
    }

    return {
        childrenData: filteredChildrenData,
        duration: Date.now() - start,
    };
}
