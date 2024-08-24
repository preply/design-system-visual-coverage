import {
    CoverageContainer,
    CoverageContainerDomAttributeValue,
} from '@preply/ds-visual-coverage-core';

import { coverageContainerDomAttribute } from '../core/constants';

import { isCoverageContainer } from './isCoverageContainer';

export function parseCoverageContainerDomAttribute(value: unknown): CoverageContainer {
    if (isCoverageContainer(value)) return value;

    throw new Error('Invalid DsVisualCoverageContainerAttribute');
}

type ReturnValue = Record<typeof coverageContainerDomAttribute, string>;

function serializeCoverageContainer(params: CoverageContainer): CoverageContainerDomAttributeValue {
    return JSON.stringify(params);
}

export function getCoverageContainerAttributes<
    TEAM extends string = string,
    COMPONENT extends string = string,
>(params: CoverageContainer<TEAM, COMPONENT>): ReturnValue {
    // At the moment, there is no guarantee names unique
    return {
        [coverageContainerDomAttribute]: serializeCoverageContainer(params),
    };
}
