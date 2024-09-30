import { coverageTestIdSeparator } from '../hooks/getCoverageTestId';
import type { CoverageTestId } from '../types';

export function isCoverageTestId(value: unknown): value is CoverageTestId {
    if (typeof value !== 'string') return false;
    if (!value.includes(coverageTestIdSeparator)) return false;

    return true;
}
