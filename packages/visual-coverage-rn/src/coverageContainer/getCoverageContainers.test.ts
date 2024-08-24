import { createLogger } from '@preply/ds-visual-coverage-core';

import type { ViewMeasurement, ViewMeasurements } from '../types';

import { getCoverageContainers } from './getCoverageContainers';

const loggerStub = createLogger(false);

const emptyComponentStub: ViewMeasurement = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    accessibilityLabel: '',
    accessibilityIdentifier: '',
    instanceOf: '',
    children: [],
};
const mainCoverageContainerStub: ViewMeasurement = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    accessibilityLabel: '',
    accessibilityIdentifier: `Main-dsCoverage:coverageContainer:{"team":"app-core","component":"Main"}`,
    instanceOf: '',
    children: [],
};
const parentContainerStub: ViewMeasurement = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    accessibilityLabel: '',
    accessibilityIdentifier: `ParentComponent-dsCoverage:coverageContainer:{"team":"app-core","component":"ParentComponent"}`,
    instanceOf: '',
    children: [],
};
const childContainerStub: ViewMeasurement = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    accessibilityLabel: '',
    accessibilityIdentifier: `ChildComponent-dsCoverage:coverageContainer:{"team":"app-core","component":"ChildComponent"}`,
    instanceOf: '',
    children: [],
};

describe('getCoverageContainers', () => {
    describe('Given a list of Swift view measurements without coverage containers', () => {
        it('should return an empty array', () => {
            // Arrange
            const viewMeasurements: ViewMeasurements = [
                {
                    ...emptyComponentStub,
                },
                {
                    ...emptyComponentStub,
                },
                {
                    ...emptyComponentStub,
                    children: [
                        {
                            ...emptyComponentStub,
                        },
                        {
                            ...emptyComponentStub,
                            children: [
                                {
                                    ...emptyComponentStub,
                                },
                            ],
                        },
                    ],
                },
            ];

            const expectedResult: ReturnType<typeof getCoverageContainers> = [];

            // Act
            const result = getCoverageContainers({
                logger: loggerStub,
                viewMeasurements,
                shouldIgnoreContainer: () => false,
            });

            // Assert
            expect(result).toEqual(expectedResult);
        });
    });

    describe('Given a list of Swift view measurements with one coverage containers', () => {
        it('should return the coverage container', () => {
            // Arrange
            const viewMeasurements: ViewMeasurements = [
                {
                    ...mainCoverageContainerStub,
                },
                {
                    ...emptyComponentStub,
                },
            ];

            const expectedResult: ReturnType<typeof getCoverageContainers> = [
                {
                    ...mainCoverageContainerStub,
                },
            ];

            // Act
            const result = getCoverageContainers({
                logger: loggerStub,
                viewMeasurements,
                shouldIgnoreContainer: () => false,
            });

            // Assert
            expect(result).toEqual(expectedResult);
        });
    });

    describe('Given a list of Swift view measurements with coverage containers nested at different levels', () => {
        it('should return the split coverage containers', () => {
            // Arrange
            const viewMeasurements: ViewMeasurements = [
                {
                    ...mainCoverageContainerStub,
                },
                {
                    ...emptyComponentStub,
                },
                {
                    ...emptyComponentStub,
                    children: [
                        {
                            ...emptyComponentStub,
                        },
                        {
                            ...parentContainerStub,
                            children: [
                                {
                                    ...emptyComponentStub,
                                    children: [
                                        {
                                            ...childContainerStub,
                                            children: [
                                                {
                                                    ...emptyComponentStub,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ];

            const expectedResult: ReturnType<typeof getCoverageContainers> = [
                {
                    ...mainCoverageContainerStub,
                },
                {
                    ...parentContainerStub,
                    children: [
                        {
                            ...emptyComponentStub,
                            children: [
                                {
                                    ...childContainerStub,
                                    children: [
                                        {
                                            ...emptyComponentStub,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    ...childContainerStub,
                    children: [
                        {
                            ...emptyComponentStub,
                        },
                    ],
                },
            ];

            // Act
            const result = getCoverageContainers({
                logger: loggerStub,
                viewMeasurements,
                shouldIgnoreContainer: () => false,
            });

            // Assert
            expect(result).toEqual(expectedResult);
        });
    });
});
