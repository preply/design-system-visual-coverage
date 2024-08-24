import { coverageContainerTestIdSeparator } from '../hooks/useCoverageContainerTestId';
import type { ViewMeasurement } from '../types';

export function hasCoverageContainerAccessibilityIdentifier(
    viewMeasurement: ViewMeasurement,
): boolean {
    return viewMeasurement.accessibilityIdentifier.includes(coverageContainerTestIdSeparator);
}
