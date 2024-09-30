import { createLogger, createRect } from '@preply/ds-visual-coverage-core';

import type { ViewMeasurement, ViewMeasurements } from '../types';

import { loopOverContainerChildren } from './loopOverContainerChildren';

const loggerStub = createLogger(false);

const emptyCoordinatesStub = { top: 0, left: 0, width: 0, height: 0 };

const emptyComponentStub: ViewMeasurement = {
    ...emptyCoordinatesStub,
    children: [],
    instanceOf: '',
    accessibilityLabel: '',
    accessibilityIdentifier: '',
};
const nestedContainerStub: ViewMeasurement = {
    ...emptyComponentStub,
    accessibilityIdentifier:
        'ChildComponent-dsCoverage:coverageContainer:{"team":"app-core","component":"ChildComponent"}',
};
const layoutDsComponent: ViewMeasurement = {
    ...emptyComponentStub,
    accessibilityIdentifier: 'ParentComponent-dsCoverage:dsComponent:LayoutFlex',
};
const uiDsComponent: ViewMeasurement = {
    ...emptyComponentStub,
    accessibilityIdentifier: 'ParentComponent-dsCoverage:dsComponent:Button',
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
                    dsComponentType: 'layoutDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),

                    componentData: 'ParentComponent-dsCoverage:dsComponent:LayoutFlex',
                },
                {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
                    componentData: 'ParentComponent-dsCoverage:dsComponent:Button',
                },
            ];

            // Act
            const result = loopOverContainerChildren({
                logger: loggerStub,
                children,
            });

            // Assert
            expect(result.childrenData).toEqual(expectedResult);
        });
    });

    describe('Given a DS layout + DS ui tree and some a ui component child', () => {
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
                    dsComponentType: 'layoutDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
                    componentData: 'ParentComponent-dsCoverage:dsComponent:LayoutFlex',
                },
                {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
                    componentData: 'ParentComponent-dsCoverage:dsComponent:Button',
                },
                {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: true,
                    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
                    componentData: '',
                },
            ];

            // Act
            const result = loopOverContainerChildren({
                logger: loggerStub,
                children,
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
                logger: loggerStub,
                children,
            });

            // Assert
            expect(result.childrenData).toEqual(expectedResult);
        });
    });
});
