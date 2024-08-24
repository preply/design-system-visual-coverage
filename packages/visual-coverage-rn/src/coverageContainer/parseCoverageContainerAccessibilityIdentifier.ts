import { CoverageContainer } from '@preply/ds-visual-coverage-core';

import { coverageTestIdSeparator } from '../hooks/getCoverageTestId';
import { coverageContainerTestIdSeparator } from '../hooks/useCoverageContainerTestId';

import { isCoverageContainer } from './isCoverageContainer';
import { isCoverageContainerTestIdSuffix } from './isCoverageContainerTestIdSuffix';
import { isCoverageTestId } from './isCoverageTestId';

export function parseCoverageContainerAccessibilityIdentifier(value: unknown): CoverageContainer {
    if (!isCoverageTestId(value)) throw new Error(`String is not a valid test id (${value})`);
    if (!isCoverageContainerTestIdSuffix(value))
        throw new Error(`String is not a valid coverage container test id (${value})`);

    let coverageContainer: string;
    try {
        // A component could be either a DS coverage container and a DS component
        const splitTestId = value.split(coverageTestIdSeparator);
        const coverageContainerPart = splitTestId.find(part =>
            part.includes(coverageContainerTestIdSeparator),
        );
        if (coverageContainerPart === undefined) {
            throw new Error(`No coverage container data in (${value})`);
        }

        const splitCoverageContainerPart = coverageContainerPart.split(
            coverageContainerTestIdSeparator,
        );
        if (splitCoverageContainerPart.length < 2) {
            throw new Error(
                `splitCoverageContainerPart is too short ${splitCoverageContainerPart} (this should be a TS-only protection)`,
            );
        }
        if (splitCoverageContainerPart[1] === undefined) {
            throw new Error(
                `splitCoverageContainerPart[1] is undefined (this should be a TS-only protection)`,
            );
        }
        coverageContainer = JSON.parse(splitCoverageContainerPart[1]);
    } catch {
        throw new Error(`String is not a valid JSON (${value})`);
    }

    if (!isCoverageContainer(coverageContainer))
        throw new Error(
            `String is not a valid coverage container (${JSON.stringify(coverageContainer)})`,
        );

    return coverageContainer;
}
