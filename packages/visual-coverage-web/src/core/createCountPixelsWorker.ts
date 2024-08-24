// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
// The function CAN NOT use any external variable or function! (but it can import types, of course)
// It must be self-contained and not rely on any external context since it's launched inside a Web
// Worker with a different context compared to the UI thread.
// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

import type {
    Bitmap,
    ChildData,
    ComponentType,
    HighestNumber,
    Logger,
    Pixel,
    PixelCounts,
    ReadableCharByPixel,
    Rect,
    WeightByComponentName,
} from '@preply/ds-visual-coverage-core';

export type Params = {
    log: boolean;
    elementRect: Rect;
    printAsciiArt: boolean;
    childrenData: ChildData[];
    offset: { top: number; left: number };
    weightByComponentName: WeightByComponentName;
};

export type CountPixelsWorkerEvent =
    | {
          status: 'complete';
          data: {
              pixelCounts: PixelCounts;
          };
      }
    | { status: 'error'; error: unknown };

export function createCountPixelsWorker(): Worker {
    // Defining function which will be used as Web Worker

    //  TODO: fix it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workerFn = (self: any) => {
        // Listening to messages from Main Thread

        self.onmessage = function onWorkerMessage(e: { data: Params }) {
            const { log, offset, elementRect, childrenData, printAsciiArt, weightByComponentName } =
                e.data;

            // --------------------------------------------------
            // UTILS
            // 🚨🚨🚨 the following functions are duplicated from other homonymous functions of this feature 🚨🚨🚨
            // --------------------------------------------------

            function createPixelCounts(): PixelCounts {
                const length: HighestNumber = 8;
                const pixelCounts = new Uint32Array(length + 1);

                return pixelCounts;
            }

            function getRectProperty(rect: Rect, property: 'top' | 'left' | 'width' | 'height') {
                if (property === 'top') return rect[0] ?? 0;
                if (property === 'left') return rect[1] ?? 0;
                if (property === 'width') return rect[2] ?? 0;
                if (property === 'height') return rect[3] ?? 0;

                throw new Error(`Invalid property: ${property}`);
            }

            function createBitmap(width: number, height: number) {
                const bitmap: Bitmap = new Uint8Array(Math.floor(width) * Math.floor(height));

                return bitmap;
            }

            function setBitmapPixel({
                top,
                left,
                width,
                value,
                bitmap: vP,
            }: {
                top: number;
                left: number;
                width: number;
                value: Pixel;
                bitmap: Bitmap;
            }) {
                vP[top * width + left] = value;
            }

            function workerLogger(...args: unknown[]) {
                const dsName = 'preply';

                console.log(
                    `%c ${dsName} coverage `,
                    'background: #FF7AAC; color: #121117; padding: 2px; border-radius: 2px;',
                    ...args,
                );
            }

            const createWorkerLogger = (logIsEnabled: boolean) =>
                logIsEnabled ? workerLogger : () => {};

            const defaultReadableCharByPixelType: ReadableCharByPixel = {
                0: '⬛️',
                1: '🟥',
                2: '🟩',

                // DS components
                3: '🟩',
                4: '🟪',
                5: '🟩',
                6: '🟩',
                7: '🟩',
                8: '🟪',
            };

            function getReadableBitmap(params: {
                width: number;
                bitmap: Bitmap;
                readableCharByPixelType?: ReadableCharByPixel;
            }): string {
                const {
                    width,
                    bitmap,
                    readableCharByPixelType = defaultReadableCharByPixelType,
                } = params;
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

                    const printedPixel = readableCharByPixelType[pixel];

                    string += printedPixel;
                }

                return string;
            }

            function logBitmap(params: { width: number; logger: Logger; bitmap: Bitmap }) {
                const { width, logger, bitmap } = params;

                logger(getReadableBitmap({ width, bitmap }));
            }

            const pixelByComponentType: Record<ComponentType, Pixel> = {
                nonDsComponent: 1,
                uiDsComponent: 2,
                utilDsComponent: 3,
                rebrandComponent: 4,
                layoutDsComponent: 5,
                unknownDsComponent: 6,
                outdatedDsComponent: 7,
                dsCandidateComponent: 8,
            };

            // --------------------------------------------------
            // --------------------------------------------------

            const logger = createWorkerLogger(log);

            const bitmap = createBitmap(
                getRectProperty(elementRect, 'width'),
                getRectProperty(elementRect, 'height'),
            );

            try {
                for (let i = 0, n = childrenData.length; i < n; i++) {
                    const childData = childrenData[i];
                    if (!childData)
                        throw new Error(
                            `No childData at ${i} (this should be a TS-only protection)`,
                        );

                    const { rect, dsComponentType, isChildOfUiDsComponent, dsComponentName } =
                        childData;

                    const adjustedSsComponentType: ComponentType = isChildOfUiDsComponent
                        ? 'unknownDsComponent' // children of ui components are treated as DS components too
                        : dsComponentType;

                    const pixel = pixelByComponentType[adjustedSsComponentType];

                    const offsetTop = offset.top;
                    const offsetLeft = offset.left;

                    const rectTop = getRectProperty(rect, 'top');
                    const rectLeft = getRectProperty(rect, 'left');
                    const rectWidth = getRectProperty(rect, 'width');
                    const rectHeight = getRectProperty(rect, 'height');
                    const rowLength = getRectProperty(elementRect, 'height');
                    const columnLength = getRectProperty(elementRect, 'width');

                    const weight = weightByComponentName[dsComponentName ?? 'nonDsComponent'];
                    if (weight === undefined) {
                        throw new Error(
                            `No weight for ${dsComponentName} (this should be a TS-only protection)`,
                        );
                    }
                    for (let weightLine = 0; weightLine < weight; weightLine++) {
                        // "Draw" the rows in bitmap
                        const top = Math.floor(rectTop - offsetTop + weightLine);
                        const bottom = Math.floor(
                            rectTop - offsetTop + rectHeight - 1 - weightLine,
                        );

                        for (let currentLeft = Math.floor(rectLeft - offsetLeft); ; currentLeft++) {
                            // Happens when the weight is higher than half the height of the element, and so top and bottom flip
                            // Ex. first loop with weight = 5
                            // [
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , ,L,L,L,L,L,], 👈👈👈 top
                            //              [ , , , , ,L, , , , ,],
                            //              [ , , , , ,L, , , , ,],
                            //              [ , , , , ,L,L,L,L,L,], 👈👈👈 bottom
                            //              [ , , , , , , , , , ,],
                            // ]
                            // second iteration with weight = 5
                            // [
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , ,L,L,L,L,L,],
                            //              [ , , , , ,L,L,L,L,L,], 👈👈👈 top
                            //              [ , , , , ,L,L,L,L,L,], 👈👈👈 bottom
                            //              [ , , , , ,L,L,L,L,L,],
                            //              [ , , , , , , , , , ,],
                            // ]
                            // third iteration with weight = 5 (the loop must break)
                            // [
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , ,L,L,L,L,L,],
                            //              [ , , , , ,L,L,L,L,L,], 👈👈👈 bottom
                            //              [ , , , , ,L,L,L,L,L,], 👈👈👈 top
                            //              [ , , , , ,L,L,L,L,L,],
                            //              [ , , , , , , , , , ,],
                            // ]
                            const topRowCrossedHalfHeight = top > bottom;
                            const noMoreHorizontalLinesToDraw = topRowCrossedHalfHeight;
                            if (noMoreHorizontalLinesToDraw) break;

                            // This is the loop condition, here it's more readable
                            const isAtTheRightOfTheViewport =
                                currentLeft >= rectLeft - offsetLeft + rectWidth ||
                                currentLeft >= columnLength;
                            if (isAtTheRightOfTheViewport) break;

                            const isAtTheLeftOfTheViewport = currentLeft < 0; // can happen for elements placed outside the viewport
                            if (isAtTheLeftOfTheViewport) continue;

                            // "Draw" the top row
                            // [
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , , , , , , ,],
                            //        👉👉👉 [ , , , , ,L,L,L,L,L,], 👈👈👈
                            //              [ , , , , ,L, , , ,L,],
                            //              [ , , , , ,L,L,L,L,L,],
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , , , , , , ,],
                            // ]
                            const topRowIsInsideTheViewport = top >= 0 && top < rowLength;
                            if (topRowIsInsideTheViewport) {
                                setBitmapPixel({
                                    top,
                                    bitmap,
                                    left: currentLeft,
                                    value: pixel,
                                    width: getRectProperty(elementRect, 'width'),
                                });
                            }

                            // "Draw" the bottom row
                            // [
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , ,L,L,L,L,L,],
                            //              [ , , , , ,L, , , ,L,],
                            //        👉👉👉 [ , , , , ,L,L,L,L,L,], 👈👈👈
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , , , , , , ,],
                            //              [ , , , , , , , , , ,],
                            // ]
                            const bottomRowIsInsideTheViewport = bottom >= 0 && bottom < rowLength;
                            if (bottomRowIsInsideTheViewport) {
                                setBitmapPixel({
                                    top: bottom,
                                    bitmap,
                                    left: currentLeft,
                                    value: pixel,
                                    width: getRectProperty(elementRect, 'width'),
                                });
                            }
                        }

                        // "Draw" the columns in bitmap
                        const left = Math.floor(rectLeft - offsetLeft + weightLine);
                        const right = Math.floor(
                            rectLeft - offsetLeft + rectWidth - 1 - weightLine,
                        );
                        for (let currentTop = Math.floor(rectTop - offsetTop); ; currentTop++) {
                            // Happens when the weight is higher than half the height of the element, and so top and bottom flip. Look at noMoreHorizontalLinesToDraw's comment
                            const noMoreVerticalLinesToDraw = left > right;
                            if (noMoreVerticalLinesToDraw) break;

                            // This is the loop condition, here it's more readable
                            const isAtTheBottomOfTheViewport =
                                currentTop >= rectTop - offsetTop + rectHeight - 1 ||
                                currentTop > rowLength;
                            if (isAtTheBottomOfTheViewport) break;

                            const isAtTheTopOfTheViewport = currentTop < 0; // can happen for elements placed outside the viewport
                            if (isAtTheTopOfTheViewport) continue;

                            // "Draw" the left column
                            // [
                            //               👇
                            //               👇
                            //               👇
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , ,L,L,L,L,L,],
                            //    [ , , , , ,L, , , ,L,],
                            //    [ , , , , ,L,L,L,L,L,],
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , , , , , , ,],
                            //               👆
                            //               👆
                            //               👆
                            // ]
                            const leftColumnIsInsideTheViewport =
                                left >= 0 && currentTop < rowLength && left < columnLength;
                            if (leftColumnIsInsideTheViewport) {
                                setBitmapPixel({
                                    left,
                                    bitmap,
                                    top: currentTop,
                                    value: pixel,
                                    width: getRectProperty(elementRect, 'width'),
                                });
                            }

                            // "Draw" the right column
                            // [
                            //                       👇
                            //                       👇
                            //                       👇
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , ,L,L,L,L,L,],
                            //    [ , , , , ,L, , , ,L,],
                            //    [ , , , , ,L,L,L,L,L,],
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , , , , , , ,],
                            //    [ , , , , , , , , , ,],
                            //                       👆
                            //                       👆
                            //                       👆
                            // ]
                            const rigthtColumnIsInsideTheViewport =
                                right >= 0 && currentTop < rowLength && right < columnLength;
                            if (rigthtColumnIsInsideTheViewport) {
                                setBitmapPixel({
                                    bitmap,
                                    top: currentTop,
                                    left: right,
                                    value: pixel,
                                    width: getRectProperty(elementRect, 'width'),
                                });
                            }
                        }
                    }
                }

                const pixelCounts = createPixelCounts();
                for (let i = 0, n = bitmap.length; i < n; i++) {
                    const pixelAsNumber = bitmap[i];
                    if (pixelAsNumber === undefined) {
                        throw new Error(`No pixel at ${i} (this should be a TS-only protection)`);
                    }
                    pixelCounts[pixelAsNumber]++;
                }

                if (printAsciiArt) {
                    logBitmap({
                        logger,
                        bitmap,
                        width: getRectProperty(elementRect, 'width'),
                    });
                }

                const event: CountPixelsWorkerEvent = {
                    status: 'complete',
                    data: {
                        pixelCounts,
                    },
                };

                self.postMessage(event);
            } catch (error) {
                const event: CountPixelsWorkerEvent = { status: 'error', error };

                self.postMessage(event);
            }
        };
    };

    // Stringify the function and creating Blob
    const blob = new Blob([`(${workerFn.toString()})(self)`], { type: 'text/javascript' });

    // Creating URL for the Blob for Worker
    const url = URL.createObjectURL(blob);

    // Return new Worker
    return new Worker(url);
}
