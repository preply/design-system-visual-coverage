import { createRect } from '../rect/rectProperties';
import { ChildData } from '../types';

import { emptyPixel } from './constants';
import { countPixels } from './countPixels';

import type { Bitmap } from '@preply/ds-visual-coverage-core';

export function getReadableBitmap(params: {
    width: number;
    bitmap: Bitmap;
    readablePixelByComponentName: Record<string, string>;
}): string {
    const { width, bitmap, readablePixelByComponentName } = params;
    let string = '';

    for (let i = 0; i < bitmap.length; i++) {
        if (i % width === 0) {
            string += '\n';
        }

        const pixelAsNumber = bitmap[i];
        if (pixelAsNumber === undefined) {
            throw new Error(`No pixel at ${i} (this should be a TS-only protection)`);
        }
        const pixel = pixelAsNumber.toString();

        const printedPixel = readablePixelByComponentName[pixel];

        string += printedPixel;
    }

    return string;
}

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
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'red',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'red',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    rect: createRect({ top: 6, left: 2, width: 16, height: 3 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'green',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'green',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'green',
                };
                const dsBox: ChildData = {
                    dsComponentName: 'Box',
                    rect: createRect({ top: 15, left: 0, width: 20, height: 5 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'green',
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
                    elementRect: coverageContainerRect,
                    childrenData,
                    offset: { top: 0, left: 0 },
                });

                expect(
                    getReadableBitmap({
                        width: 20,
                        bitmap: result.bitmap,
                        readablePixelByComponentName: {
                            [result.pixelByComponentName.Heading!]: '🟩',
                            [result.pixelByComponentName.Button!]: '🟩',
                            [result.pixelByComponentName.Box!]: '🟩',
                            [emptyPixel]: '⬛️',
                            [result.nonDsComponentsPixel]: '🟥',
                        },
                    }),
                ).toMatchInlineSnapshot(`
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
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    weight: 2,
                    debugInfo: '',
                    debugColor: 'red',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    weight: 2,
                    debugInfo: '',
                    debugColor: 'red',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    rect: createRect({ top: 6, left: 2, width: 16, height: 3 }),
                    weight: 2,
                    debugInfo: '',
                    debugColor: 'green',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    weight: 2,
                    debugInfo: '',
                    debugColor: 'green',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    weight: 2,
                    debugInfo: '',
                    debugColor: 'green',
                };
                const dsBox: ChildData = {
                    dsComponentName: 'Box',
                    rect: createRect({ top: 15, left: 0, width: 20, height: 5 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'green',
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
                    elementRect: coverageContainerRect,
                    childrenData,
                    offset: { top: 0, left: 0 },
                });
                expect(
                    getReadableBitmap({
                        width: 20,
                        bitmap: result.bitmap,
                        readablePixelByComponentName: {
                            [result.pixelByComponentName.Heading!]: '🟩',
                            [result.pixelByComponentName.Button!]: '🟩',
                            [result.pixelByComponentName.Box!]: '🟩',
                            [emptyPixel]: '⬛️',
                            [result.nonDsComponentsPixel]: '🟥',
                        },
                    }),
                ).toMatchInlineSnapshot(`
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
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'red',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'red',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    rect: createRect({ top: 4, left: 0, width: 16, height: 3 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'green',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'green',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'green',
                };

                const childrenData: ChildData[] = [
                    productHeader,
                    productBox,
                    dsHeading,
                    dsButton1,
                    dsButton2,
                ];

                const result = countPixels({
                    elementRect: coverageContainerRect,
                    childrenData,
                    offset: { top: 0, left: 0 },
                });
                expect(
                    getReadableBitmap({
                        width: 20,
                        bitmap: result.bitmap,
                        readablePixelByComponentName: {
                            [result.pixelByComponentName.Heading!]: '🟩',
                            [result.pixelByComponentName.Button!]: '🟩',
                            [emptyPixel]: '⬛️',
                            [result.nonDsComponentsPixel]: '🟥',
                        },
                    }),
                ).toMatchInlineSnapshot(`
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
                    rect: createRect({ top: 0, left: 0, width: 20, height: 3 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'red',
                };
                const productBox: ChildData = {
                    dsComponentName: null,
                    rect: createRect({ top: 4, left: 0, width: 20, height: 11 }),
                    weight: 1,
                    debugInfo: '',
                    debugColor: 'red',
                };
                const dsHeading: ChildData = {
                    dsComponentName: 'Heading',
                    rect: createRect({ top: 4, left: 0, width: 16, height: 3 }),
                    weight: 3,
                    debugInfo: '',
                    debugColor: 'green',
                };
                const dsButton1: ChildData = {
                    dsComponentName: 'Button',
                    rect: createRect({ top: 10, left: 7, width: 5, height: 3 }),
                    weight: 2,
                    debugInfo: '',
                    debugColor: 'green',
                };
                const dsButton2: ChildData = {
                    dsComponentName: 'Button',
                    rect: createRect({ top: 10, left: 13, width: 5, height: 3 }),
                    weight: 2,
                    debugInfo: '',
                    debugColor: 'green',
                };

                const childrenData: ChildData[] = [
                    productHeader,
                    productBox,
                    dsHeading,
                    dsButton1,
                    dsButton2,
                ];

                const result = countPixels({
                    elementRect: coverageContainerRect,
                    childrenData,
                    offset: { top: 0, left: 0 },
                });
                expect(
                    getReadableBitmap({
                        width: 20,
                        bitmap: result.bitmap,
                        readablePixelByComponentName: {
                            [result.pixelByComponentName.Heading!]: '🟩',
                            [result.pixelByComponentName.Button!]: '🟩',
                            [emptyPixel]: '⬛️',
                            [result.nonDsComponentsPixel]: '🟥',
                        },
                    }),
                ).toMatchInlineSnapshot(`
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
