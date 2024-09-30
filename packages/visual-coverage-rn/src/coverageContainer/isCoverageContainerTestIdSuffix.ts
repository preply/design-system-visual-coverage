import { coverageContainerTestIdSeparator } from '../hooks/useCoverageContainerTestId';
import type { CoverageContainerTestIdSuffix } from '../types';

export function isCoverageContainerTestIdSuffix(
    value: unknown,
): value is CoverageContainerTestIdSuffix {
    if (typeof value !== 'string') return false;
    if (!value.includes(coverageContainerTestIdSeparator)) return false;

    return true;
}
