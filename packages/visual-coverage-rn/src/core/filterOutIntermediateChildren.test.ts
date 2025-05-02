import type { ChildData } from '@preply/ds-visual-coverage-core';
import { createLogger, createRect } from '@preply/ds-visual-coverage-core';

import { filterOutIntermediateChildren } from './filterOutIntermediateChildren';

const loggerStub = createLogger(false);

const intermediateSwiftViewStub: ChildData = {
    dsComponentName: null,
    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
    debugInfo: '',
    weight: 0,
    debugColor: 'red',
};
const layoutDsComponentStub: ChildData = {
    dsComponentName: 'LayoutFlex',
    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
    debugInfo: 'ParentComponent-dsCoverage:dsComponent:LayoutFlex',
    weight: 0,
    debugColor: 'green',
};

const uiDsComponentStub: ChildData = {
    dsComponentName: 'Button',
    rect: createRect({ top: 0, left: 0, width: 0, height: 0 }),
    debugInfo: 'ParentComponent-dsCoverage:dsComponent:Button',
    weight: 21,
    debugColor: 'green',
};

describe('filterOutIntermediateChildren', () => {
    describe('Given two intermediate Swift views', () => {
        it('should keep only one', () => {
            // Arrange
            const childrenData: ChildData[] = [
                { ...intermediateSwiftViewStub },
                { ...intermediateSwiftViewStub },
            ];

            const expectedResult: ReturnType<typeof filterOutIntermediateChildren>['childrenData'] =
                [{ ...intermediateSwiftViewStub }];

            // Act
            const result = filterOutIntermediateChildren({
                logger: loggerStub,
                childrenData,
            });

            // Assert
            expect(result.childrenData).toEqual(expectedResult);
        });
    });

    describe('Given more than two intermediate Swift views', () => {
        it('should keep only one', () => {
            // Arrange
            const childrenData: ChildData[] = [
                { ...intermediateSwiftViewStub },
                { ...intermediateSwiftViewStub },
                { ...intermediateSwiftViewStub },
                { ...intermediateSwiftViewStub },
                { ...intermediateSwiftViewStub },
            ];

            const expectedResult: ReturnType<typeof filterOutIntermediateChildren>['childrenData'] =
                [{ ...intermediateSwiftViewStub }];

            // Act
            const result = filterOutIntermediateChildren({
                logger: loggerStub,
                childrenData,
            });

            // Assert
            expect(result.childrenData).toEqual(expectedResult);
        });
    });

    describe('Given some intermediate Swift views and a layout DS component', () => {
        it('should keep only the layout DS component', () => {
            // Arrange
            const childrenData: ChildData[] = [
                { ...intermediateSwiftViewStub },
                { ...intermediateSwiftViewStub },
                { ...layoutDsComponentStub },
                { ...intermediateSwiftViewStub },
                { ...intermediateSwiftViewStub },
            ];

            const expectedResult: ReturnType<typeof filterOutIntermediateChildren>['childrenData'] =
                [{ ...layoutDsComponentStub }];

            // Act
            const result = filterOutIntermediateChildren({
                logger: loggerStub,
                childrenData,
            });

            // Assert
            expect(result.childrenData).toEqual(expectedResult);
        });
    });

    describe('Given some intermediate Swift views, a layout DS component, and a DS ui component', () => {
        it('should keep only the DS components', () => {
            // Arrange
            const childrenData: ChildData[] = [
                { ...intermediateSwiftViewStub },
                { ...intermediateSwiftViewStub },
                { ...layoutDsComponentStub },
                { ...uiDsComponentStub },
                { ...intermediateSwiftViewStub },
                { ...intermediateSwiftViewStub },
            ];

            const expectedResult: ReturnType<typeof filterOutIntermediateChildren>['childrenData'] =
                [{ ...layoutDsComponentStub }, { ...uiDsComponentStub }];

            // Act
            const result = filterOutIntermediateChildren({
                logger: loggerStub,
                childrenData,
            });

            // Assert
            expect(result.childrenData).toEqual(expectedResult);
        });
    });

    describe('Given some equal DS components', () => {
        it('should keep all of them', () => {
            // Arrange
            const childrenData: ChildData[] = [
                { ...layoutDsComponentStub },
                { ...uiDsComponentStub },
                { ...layoutDsComponentStub },
                { ...uiDsComponentStub },
                { ...layoutDsComponentStub },
                { ...uiDsComponentStub },
            ];

            const expectedResult: ReturnType<typeof filterOutIntermediateChildren>['childrenData'] =
                [
                    { ...layoutDsComponentStub },
                    { ...uiDsComponentStub },
                    { ...layoutDsComponentStub },
                    { ...uiDsComponentStub },
                    { ...layoutDsComponentStub },
                    { ...uiDsComponentStub },
                ];

            // Act
            const result = filterOutIntermediateChildren({
                logger: loggerStub,
                childrenData,
            });

            // Assert
            expect(result.childrenData).toEqual(expectedResult);
        });
    });
});
