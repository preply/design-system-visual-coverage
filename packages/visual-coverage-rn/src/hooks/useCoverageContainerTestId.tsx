import type { CoverageContainer } from '@preply/ds-visual-coverage-core';

import { useIsCoverageEnabled } from '../contextProviders/CoverageSetupProvider';
import { serializeCoverageContainer } from '../core/serializeCoverageContainer';
import type { CoverageContainerTestIdSuffix, CoverageTestId } from '../types';

import { getCoverageTestId } from './getCoverageTestId';

type Params<TEAM extends string = string, COMPONENT extends string = string> = {
    testID?: string;
} & CoverageContainer<TEAM, COMPONENT>;

export const coverageContainerTestIdSeparator = 'coverageContainer:';

/**
 * Add DS container data to React Native's testID. Leave the testID untouched if the visual coverage
 * is not enabled.
 *
 * Used to assign a team and a name to all the app views and subcomponents. Teams and components
 * are used to calculate punctual visual coverage metrics.
 *
 * Typically, it's used to
 * 1. Wrap (from a coverage perspective) all the app tree as a fallback
 * 2. Wrap every single page/view that's rendered for a route
 * 3. Wrap every single component that's belongs to a different team compared to the rest of the page
 * 4. Wrap every single component that has a huge hidden area to limit the visual coverage calculation
 * to the component's visible area (at the moment of writing, the hidden area is considered by the coverage
 * script since it does not handle overflows)
 * 5. Wrap every single component that is shown on top of the app, like a modal (at the moment of writing,
 * z-index and depth is not managed by the coverage script)
 */
export function useCoverageContainerTestId<
    TEAM extends string = string,
    COMPONENT extends string = string,
>(params: Params<TEAM, COMPONENT>): string | undefined | CoverageTestId {
    const { testID, ...coverageContainerProps } = params;

    const enabled = useIsCoverageEnabled();
    if (!enabled) return testID;

    // At the moment, there is no guarantee component names are unique
    const stringifiedCoverageContainer = serializeCoverageContainer(coverageContainerProps);
    const coverageContainerTestIdSuffix: CoverageContainerTestIdSuffix = `${coverageContainerTestIdSeparator}${stringifiedCoverageContainer}`;

    return getCoverageTestId(testID, coverageContainerTestIdSuffix);
}
