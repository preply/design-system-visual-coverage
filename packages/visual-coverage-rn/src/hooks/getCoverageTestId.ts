import type { CoverageTestId } from '../types';

export const coverageTestIdSeparator = '-dsCoverage:';

/**
 * Enrich React Native's testID (`accessibilityIdentifier` in Swift) with DS visual coverage data.
 *
 * Used to assign a team and a name to all the app views and subcomponents. Teams and components
 * are used to calculate punctual visual coverage metrics.
 * Typically, it's used to
 * 1. Get a testID for every single page/view that's rendered for a route
 * 2. Get a testID for every single component that's belongs to a different team compared to the rest of the page
 * 3. Get a testID for every single component that has a huge hidden area to limit the visual coverage calculation
 * to the component's visible area (at the moment of writing, the hidden area is considered by the coverage
 * script since it does not handle overflows)
 * 4. Wrap every single component that is shown on top of the app, like a modal (at the moment of writing,
 * z-index and depth is not managed by the coverage script)
 * 5. Get a testID to ignore a component
 */
export function getCoverageTestId(
    testID: string | undefined,
    coverageTestId: string,
): string | undefined | CoverageTestId {
    return `${testID}${coverageTestIdSeparator}${coverageTestId}`;
}
