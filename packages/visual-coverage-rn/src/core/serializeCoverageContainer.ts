import type {
    CoverageContainer,
    CoverageContainerDomAttributeValue,
} from '@preply/ds-visual-coverage-core';

export function serializeCoverageContainer(
    params: CoverageContainer,
): CoverageContainerDomAttributeValue {
    return JSON.stringify(params);
}
