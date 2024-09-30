import { useIsCoverageEnabled } from '../contextProviders/CoverageSetupProvider';

import { getCoverageTestId } from './getCoverageTestId';

export const dsComponentTestIdSeparator = 'dsComponent:';

type Params = {
    componentName: string;
    testID?: string | undefined;
};

/**
 * Add DS component data to React Native's testID. Leave the testID untouched if the visual coverage
 * is not enabled.
 */
export function useDsComponentTestId(params: Params): string | undefined {
    const { testID, componentName } = params;

    const enabled = useIsCoverageEnabled();
    if (!enabled) return testID;

    return getCoverageTestId(testID, `${dsComponentTestIdSeparator}${componentName ?? ''}`);
}
