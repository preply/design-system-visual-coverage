import { getReadableBitmap } from '../bitmap/getReadableBitmap';
import { createRect } from '../rect/rectProperties';
import { ChildData, WeightByComponentName } from '../types';
import { createLogger } from '../utils/createLogger';

import { defaultPixelByPixelType } from './constants';
import { countPixels } from './countPixels';

const loggerStub = createLogger(false);

const weightByComponentName: WeightByComponentName = {
    emptyPixel: 0,

    nonDsComponent: 1,
    unknownDsComponent: 1,
    Button: 1,
    Checkbox: 1,
    LayoutFlex: 1,
    Loader: 1,
};

describe('countPixels', () => {
    describe('Given a basic container', () => {
        describe('and the simplest possible component weights', () => {
            it('should create the correct bitmap', () => {
                // Arrange
                const coverageContainerRect = createRect({
                    top: 0,
                    left: 0,
                    width: 20,
                    height: 20,
                });

                // Artificially creating a layout like this:
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩

                const productHeader: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    componentData: '',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    componentData: '',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 6, left: 2, width: 16, height: 3 }),
                    componentData: '',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsBox: ChildData = {
                    dsComponentName: 'Box',
                    dsComponentType: 'layoutDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 15, left: 0, width: 20, height: 5 }),
                    componentData: '',
                };

                const childrenData: ChildData[] = [
                    productHeader,
                    productBox,
                    dsHeading,
                    dsButton1,
                    dsButton2,
                    dsBox,
                ];

                const result = countPixels({
                    logger: loggerStub,
                    elementRect: coverageContainerRect,
                    childrenData,
                    printAsciiArt: false,
                    pixelByPixelType: defaultPixelByPixelType,
                    weightByComponentName,
                    offset: { top: 0, left: 0 },
                });
                expect(getReadableBitmap({ width: 20, bitmap: result.bitmap }))
                    .toMatchInlineSnapshot(`
                                            "
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                            🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                                            🟥⬛️🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️🟥
                                            🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                                            🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"
                                    `);
            });
        });

        describe('and more complex component weights', () => {
            it('should create the correct bitmap', () => {
                // Arrange
                const coverageContainerRect = createRect({
                    top: 0,
                    left: 0,
                    width: 20,
                    height: 20,
                });

                // Artificially creating a layout like this:
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩

                const productHeader: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    componentData: '',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    componentData: '',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 6, left: 2, width: 16, height: 3 }),
                    componentData: '',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsBox: ChildData = {
                    dsComponentName: 'Box',
                    dsComponentType: 'layoutDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 15, left: 0, width: 20, height: 5 }),
                    componentData: '',
                };

                const childrenData: ChildData[] = [
                    productHeader,
                    productBox,
                    dsHeading,
                    dsButton1,
                    dsButton2,
                    dsBox,
                ];

                const result = countPixels({
                    logger: loggerStub,
                    elementRect: coverageContainerRect,
                    childrenData,
                    printAsciiArt: false,
                    pixelByPixelType: defaultPixelByPixelType,
                    weightByComponentName: {
                        ...weightByComponentName,
                        // Tweaking just some of the ones used by the test
                        nonDsComponent: 2,
                        Button: 2,
                        Heading: 2,
                    },
                    offset: { top: 0, left: 0 },
                });
                expect(getReadableBitmap({ width: 20, bitmap: result.bitmap }))
                    .toMatchInlineSnapshot(`
                                            "
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥🟥🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥🟥
                                            🟥🟥⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩🟥🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                            🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩
                                            🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"
                                    `);
            });
        });
    });

    describe('Given some overlapping components', () => {
        describe('and the simplest possible component weights', () => {
            it(`should create a bitmap`, () => {
                // Arrange
                const coverageContainerRect = createRect({
                    top: 0,
                    left: 0,
                    width: 20,
                    height: 15,
                });

                // Artificially creating a layout like this:
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥🟥🟥
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥

                const productHeader: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    componentData: '',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    componentData: '',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 16, height: 3 }),
                    componentData: '',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    componentData: '',
                };

                const childrenData: ChildData[] = [
                    productHeader,
                    productBox,
                    dsHeading,
                    dsButton1,
                    dsButton2,
                ];

                const result = countPixels({
                    logger: loggerStub,
                    elementRect: coverageContainerRect,
                    childrenData,
                    printAsciiArt: false,
                    pixelByPixelType: defaultPixelByPixelType,
                    weightByComponentName,
                    offset: { top: 0, left: 0 },
                });
                expect(getReadableBitmap({ width: 20, bitmap: result.bitmap }))
                    .toMatchInlineSnapshot(`
                                    "
                                    🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                    🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                                    ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                                    🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥🟥🟥
                                    🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                                    🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️⬛️⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                                    🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                                    🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥"
                            `);
            });
        });

        describe('and more component weights that are higher than the component weight', () => {
            it(`should create the correct bitmap where the pixels don't exit the component area`, () => {
                // Arrange
                const coverageContainerRect = createRect({
                    top: 0,
                    left: 0,
                    width: 20,
                    height: 15,
                });

                // Artificially creating a layout like this:
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                // ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥🟥🟥
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                // 🟩⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟥
                // 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️⬛️⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩⬛️⬛️⬛️🟩⬛️🟩⬛️⬛️⬛️🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                // 🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                // 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥

                const productHeader: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    componentData: '',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    dsComponentType: 'nonDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    componentData: '',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 4, left: 0, width: 16, height: 3 }),
                    componentData: '',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    componentData: '',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    dsComponentType: 'uiDsComponent',
                    isChildOfUiDsComponent: false,
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    componentData: '',
                };

                const childrenData: ChildData[] = [
                    productHeader,
                    productBox,
                    dsHeading,
                    dsButton1,
                    dsButton2,
                ];

                const result = countPixels({
                    logger: loggerStub,
                    elementRect: coverageContainerRect,
                    childrenData,
                    printAsciiArt: false,
                    pixelByPixelType: defaultPixelByPixelType,
                    weightByComponentName: {
                        ...weightByComponentName,
                        // Tweaking just some of the ones used by the test
                        Heading: 3,
                        Button: 2,
                    },
                    offset: { top: 0, left: 0 },
                });
                expect(getReadableBitmap({ width: 20, bitmap: result.bitmap }))
                    .toMatchInlineSnapshot(`
                        "
                        🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                        🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
                        ⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️
                        🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥🟥🟥
                        🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️⬛️⬛️🟥
                        🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛️⬛️⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️🟩🟩🟩🟩🟩⬛️🟩🟩🟩🟩🟩⬛️🟥
                        🟥⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️⬛️🟥
                        🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥"
                    `);
            });
        });
    });
});
