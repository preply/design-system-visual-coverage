import { createLogger, createRect, GetContainerData } from '@preply/ds-visual-coverage-core';
import type { ChildData } from '@preply/ds-visual-coverage-core';

import type { ViewMeasurement, ViewMeasurements } from '../types';

import { loopOverContainerChildren } from './loopOverContainerChildren';

const loggerStub = createLogger(false);

const emptyCoordinatesStub = { top: 0, left: 0, width: 0, height: 0 };

const emptyComponentStub: ViewMeasurement = {
    ...emptyCoordinatesStub,
    children: [],
    instanceOf: '',
    accessibilityLabel: 'emptyComponent',
    accessibilityIdentifier: '',
};
const nestedContainerStub: ViewMeasurement = {
    ...emptyComponentStub,
    // In the preply Rn package, assert about the parsed identifier
    accessibilityIdentifier: 'ChildComponent-dsCoverage:coverageContainer:ChildComponent',
};
const layoutDsComponent: ViewMeasurement = {
    ...emptyComponentStub,
    accessibilityIdentifier: 'ParentComponent-dsCoverage:dsComponent:LayoutFlex',
};
const uiDsComponent: ViewMeasurement = {
    ...emptyComponentStub,
    accessibilityIdentifier: 'ParentComponent-dsCoverage:dsComponent:Button',
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

const coverageContainerDataStub: ChildData = {
    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),

    // Any relevant information that eases debugging the result. Typically, it includes a
    // stringified version of the DOM element on Web, or `testID` on React Native. It's assigned as
    // an attribute to the colored SVGs of the preview to quickly link the React with the Child that
    // generated it
    debugInfo: 'Component-dsCoverage:coverageContainer:Component',
    debugColor: 'green',

    weight: 0,
    dsComponentName: null,
};

describe('loopOverContainerChildren', () => {
    describe('Given a DS layout + DS ui tree', () => {
        it('should return the corresponding children data', () => {
            // Arrange
            const children: ViewMeasurements = [
                {
                    ...layoutDsComponent,
                    children: [{ ...uiDsComponent }],
                },
            ];

            const expectedResult: ReturnType<typeof loopOverContainerChildren>['childrenData'] = [
                {
                    dsComponentName: 'LayoutFlex',
                    weight: 0,
                    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
                    debugInfo: 'ParentComponent-dsCoverage:dsComponent:LayoutFlex',
                    debugColor: 'green',
                },
                {
                    dsComponentName: 'Button',
                    weight: 21,
                    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
                    debugInfo: 'ParentComponent-dsCoverage:dsComponent:Button',
                    debugColor: 'green',
                },
            ];

            // Act
            const result = loopOverContainerChildren({
                children,
                getComponentData: ({ component }) => {
                    if (component.accessibilityIdentifier.includes('LayoutFlex')) {
                        return {
                            result: 'countComponent',
                            dsComponentName: 'LayoutFlex',
                            debugInfo: component.accessibilityIdentifier,
                            debugColor: 'green',
                            weight: 0,
                        };
                    } else if (component.accessibilityIdentifier.includes('Button')) {
                        return {
                            result: 'countComponent',
                            dsComponentName: 'Button',
                            debugInfo: component.accessibilityIdentifier,
                            debugColor: 'green',
                            weight: 21,
                        };
                    }

                    return {
                        result: 'countComponent',
                        dsComponentName: null,
                        debugInfo: component.accessibilityIdentifier,
                        debugColor: 'red',
                        weight: 0,
                    };
                },
                getContainerData: getContainerDataStub,
                logger: loggerStub,
                coverageContainerData: coverageContainerDataStub,
            });

            // Assert
            expect(result.childrenData).toEqual(expectedResult);
        });
    });

    describe('Given a DS layout + DS UI tree + a non-DS ui child', () => {
        it('should mark the last child as a child of a ui component', () => {
            // Arrange
            const children: ViewMeasurements = [
                {
                    ...layoutDsComponent,
                    children: [{ ...uiDsComponent, children: [{ ...emptyComponentStub }] }],
                },
            ];

            const expectedResult: ReturnType<typeof loopOverContainerChildren>['childrenData'] = [
                {
                    dsComponentName: 'LayoutFlex',
                    weight: 0,
                    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
                    debugInfo: 'ParentComponent-dsCoverage:dsComponent:LayoutFlex',
                    debugColor: 'green',
                },
                {
                    dsComponentName: 'Button',
                    weight: 21,
                    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
                    debugInfo: 'ParentComponent-dsCoverage:dsComponent:Button',
                    debugColor: 'green',
                },
                {
                    dsComponentName: 'childOfUiDsComponent',
                    weight: 1,
                    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
                    debugInfo: '',
                    debugColor: 'green',
                },
            ];

            // Act
            const result = loopOverContainerChildren({
                children,
                getComponentData: ({ component }) => {
                    if (component.accessibilityIdentifier.includes('LayoutFlex')) {
                        return {
                            result: 'countComponent',
                            dsComponentName: 'LayoutFlex',
                            debugInfo: component.accessibilityIdentifier,
                            weight: 0,
                            debugColor: 'green',
                        };
                    } else if (component.accessibilityIdentifier.includes('Button')) {
                        return {
                            result: 'countComponent',
                            dsComponentName: 'Button',
                            debugInfo: component.accessibilityIdentifier,
                            weight: 21,
                            debugColor: 'green',
                        };
                    } else if (component.accessibilityLabel === 'emptyComponent') {
                        return {
                            result: 'countComponent',
                            dsComponentName: 'childOfUiDsComponent',
                            debugInfo: component.accessibilityIdentifier,
                            weight: 1,
                            debugColor: 'green',
                        };
                    }

                    return {
                        result: 'countComponent',
                        dsComponentName: null,
                        debugInfo: component.accessibilityIdentifier,
                        weight: 0,
                        debugColor: 'red',
                    };
                },
                getContainerData: getContainerDataStub,
                logger: loggerStub,
                coverageContainerData: coverageContainerDataStub,
            });

            // Assert
            expect(result.childrenData).toEqual(expectedResult);
        });
    });

    describe('Given a nested coverage container', () => {
        it('should ignore it', () => {
            // Arrange
            const children: ViewMeasurements = [
                {
                    ...nestedContainerStub,
                    children: [{ ...layoutDsComponent, children: [{ ...uiDsComponent }] }],
                },
            ];

            const expectedResult: ReturnType<typeof loopOverContainerChildren>['childrenData'] = [];

            // Act
            const result = loopOverContainerChildren({
                children,
                getComponentData: ({ component }) => {
                    return {
                        result: 'countComponent',
                        dsComponentName: null,
                        debugInfo: component.accessibilityIdentifier,
                        debugColor: 'green',
                        weight: 0,
                    };
                },
                getContainerData: getContainerDataStub,
                logger: loggerStub,
                coverageContainerData: coverageContainerDataStub,
            });

            // Assert
            expect(result.childrenData).toEqual(expectedResult);
        });
    });
});
