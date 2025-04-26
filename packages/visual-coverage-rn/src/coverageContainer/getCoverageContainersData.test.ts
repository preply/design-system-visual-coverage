import { createLogger, createRect } from '@preply/ds-visual-coverage-core';
import type { GetContainerData } from '@preply/ds-visual-coverage-core';

import type { RootSwiftView, ViewMeasurement } from '../types';

import { getCoverageContainersData } from './getCoverageContainersData';

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
    accessibilityIdentifier:
        'Main-dsCoverage:coverageContainer:{"team":"app-core","component":"Main"}',
    instanceOf: '',
    children: [],
};
const parentContainerStub: ViewMeasurement = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    accessibilityLabel: '',
    accessibilityIdentifier:
        'ParentComponent-dsCoverage:coverageContainer:{"team":"app-core","component":"ParentComponent"}',
    instanceOf: '',
    children: [],
};
const childContainerStub: ViewMeasurement = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    accessibilityLabel: '',
    accessibilityIdentifier:
        'ChildComponent-dsCoverage:coverageContainer:{"team":"app-core","component":"ChildComponent"}',
    instanceOf: '',
    children: [],
};

const getContainerDataStub: GetContainerData<ViewMeasurement> = ({ component }) => {
    if (!component.accessibilityIdentifier) {
        return { result: 'isNotCoverageContainer' };
    }

    if (!component.accessibilityIdentifier.includes('-dsCoverage:coverageContainer:')) {
        return { result: 'isNotCoverageContainer' };
    }

    const coverageContainer = component.accessibilityIdentifier.split(
        '-dsCoverage:coverageContainer',
    )[1];

    if (!coverageContainer) {
        return {
            result: 'isNotCoverageContainer',
        };
    }

    return {
        result: 'isCoverageContainer',
        coverageContainer,
    };
};

describe('getCoverageContainersData', () => {
    describe('Given a Swift root view with coverage containers nested at different levels', () => {
        it('should return the split coverage containers', () => {
            // Arrange
            const mutableRootSwiftView: RootSwiftView = {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                viewportWidth: 0,
                viewportHeight: 0,
                accessibilityLabel: '',
                instanceOf: 'RCTRootView',
                accessibilityIdentifier: '',
                children: [
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
                ],
            };

            const expectedResult: ReturnType<typeof getCoverageContainersData> = [
                {
                    children: [],
                    instanceOf: '',
                    accessibilityLabel: '',
                    coverageContainer: mainCoverageContainerStub.accessibilityIdentifier,
                    coverageContainerAccessibilityIdentifier:
                        mainCoverageContainerStub.accessibilityIdentifier,
                    elementRect: createRect({ width: 0, height: 0, left: 0, top: 0 }),
                },
                {
                    children: [
                        {
                            accessibilityIdentifier: '',
                            accessibilityLabel: '',
                            instanceOf: '',
                            children: [
                                {
                                    accessibilityIdentifier:
                                        childContainerStub.accessibilityIdentifier,
                                    accessibilityLabel: '',
                                    children: [
                                        { ...emptyComponentStub },
                                        { ...emptyComponentStub },
                                    ],
                                    height: 0,
                                    instanceOf: '',
                                    left: 0,
                                    top: 0,
                                    width: 0,
                                },
                            ],
                            height: 0,
                            left: 0,
                            top: 0,
                            width: 0,
                        },
                    ],
                    coverageContainer: parentContainerStub.accessibilityIdentifier,
                    coverageContainerAccessibilityIdentifier:
                        parentContainerStub.accessibilityIdentifier,
                    elementRect: createRect({ width: 0, height: 0, left: 0, top: 0 }),
                    instanceOf: '',
                    accessibilityLabel: '',
                },
                {
                    children: [{ ...emptyComponentStub }, { ...emptyComponentStub }],
                    instanceOf: '',
                    accessibilityLabel: '',
                    coverageContainer: childContainerStub.accessibilityIdentifier,
                    coverageContainerAccessibilityIdentifier:
                        childContainerStub.accessibilityIdentifier,
                    elementRect: createRect({ width: 0, height: 0, left: 0, top: 0 }),
                },
            ];

            // Act
            const result = getCoverageContainersData({
                logger: loggerStub,
                mutableRootSwiftView,
                getContainerData: getContainerDataStub,
            });

            // Assert
            expect(result).toEqual(expectedResult);
        });
    });
});
