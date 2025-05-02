// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
// The function CAN NOT use any external variable or function! (but it can import types, of course)
// It must be self-contained and not rely on any external context since it's launched inside a Web
// Worker with a different context compared to the UI thread.
// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

import type { Bitmap, ChildData, Pixel, PixelCounts, Rect } from '@preply/ds-visual-coverage-core';

export type Params = {
    log: boolean;
    elementRect: Rect;
    childrenData: ChildData[];
    offset: { top: number; left: number };

    // Useful for debugging purposes. Please consider it slows down the serialization process between
    // the threads
    returnBitmap: boolean;
};

export type CountPixelsWorkerEvent =
    | {
          status: 'complete';
          data: {
              pixelCounts: PixelCounts;

              // Tells the consumer what numbers have been used for every component name, useful to
              // post-process the bitmap independently
              pixelByComponentName: Record<string, number>;

              // Tells the consumer what number has been used for the non-DS components pixels, useful to
              // post-process the bitmap independently
              nonDsComponentsPixel: number;

              // It's returned when passed with `returnBitmap: true`
              bitmap: Bitmap | null;
          };
      }
    | { status: 'error'; error: unknown }
    | { status: 'logOnMainThread'; data: unknown };

export function createCountPixelsWorker(): Worker {
    // Defining function which will be used as Web Worker

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workerFn = (self: any) => {
        // Listening to messages from Main Thread

        self.onmessage = function onWorkerMessage(e: { data: Params }) {
            const { offset, elementRect, childrenData, returnBitmap } = e.data;

            // --------------------------------------------------
            // UTILS
            // 🚨🚨🚨 the following functions are duplicated from other homonymous functions of this feature 🚨🚨🚨
            // --------------------------------------------------

            function createPixelCounts(length: number): PixelCounts {
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

            function createBitmap(width: number, height: number, highestPixel: number): Bitmap {
                if (highestPixel <= 255)
                    return new Uint8Array(Math.floor(width) * Math.floor(height));

                if (highestPixel <= 65_535)
                    return new Uint16Array(Math.floor(width) * Math.floor(height));

                return new Uint32Array(Math.floor(width) * Math.floor(height));
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

            const allComponentNames = childrenData.map(child => child.dsComponentName);
            const uniqueComponentNames = [...new Set(allComponentNames)];

            // `uniqueComponentNames` could be ['Heading', 'Button', null, 'Dropdown']. `null` should
            // not create gaps in the index.
            let dsComponentsIndex = 0;
            let nonDsComponentsPixel = 1;
            let pixelByComponentName = uniqueComponentNames.reduce<Record<string, number>>(
                (acc, dsComponentName) => {
                    if (dsComponentName && acc[dsComponentName] === undefined) {
                        acc[dsComponentName] = dsComponentsIndex;
                        dsComponentsIndex++;
                        nonDsComponentsPixel++;
                    }

                    return acc;
                },
                {},
            );

            // Example
            // {
            //   Heading: 1,
            //   Button: 2,
            //   Dropdown: 3
            // }
            //
            // The numbers will be used to fill up the bitmap. 0 can't be used because it represents
            // an empty pixel.
            pixelByComponentName = Object.keys(pixelByComponentName).reduce<Record<string, number>>(
                (acc, key) => {
                    const pixel = pixelByComponentName[key];
                    if (pixel === undefined)
                        throw new Error(`No pixel at ${key} (this should be a TS-only protection)`);

                    // 0 is a reserved pixel in the bitmap. 0 is what uint arrays gives back when you read
                    // an empty cell and it's used for empty pixels
                    acc[key] = pixel + 1;

                    return acc;
                },
                {},
            );
            // With the above example of `pixelByComponentName`, nonDsComponentsPixel is 4. And it's
            // the pixel used to mark the non-DS components, which are the ones with `dsComponentName`
            // set to `null`
            nonDsComponentsPixel++;

            const bitmap = createBitmap(
                getRectProperty(elementRect, 'width'),
                getRectProperty(elementRect, 'height'),
                nonDsComponentsPixel,
            );

            try {
                for (let i = 0, n = childrenData.length; i < n; i++) {
                    const childData = childrenData[i];
                    if (!childData)
                        throw new Error(
                            `No childData at ${i} (this should be a TS-only protection)`,
                        );

                    const { rect, dsComponentName } = childData;

                    let pixel = nonDsComponentsPixel;
                    if (dsComponentName !== null) {
                        const dsComponentNamePixel = pixelByComponentName[dsComponentName];

                        if (dsComponentNamePixel === undefined)
                            throw new Error(
                                `No dsComponentNamePixel for ${dsComponentName} (this should be a TS-only protection)`,
                            );

                        pixel = dsComponentNamePixel;
                    }

                    const offsetTop = offset.top;
                    const offsetLeft = offset.left;

                    const rectTop = getRectProperty(rect, 'top');
                    const rectLeft = getRectProperty(rect, 'left');
                    const rectWidth = getRectProperty(rect, 'width');
                    const rectHeight = getRectProperty(rect, 'height');
                    const rowLength = getRectProperty(elementRect, 'height');
                    const columnLength = getRectProperty(elementRect, 'width');

                    const weight = childData.weight;
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

                const pixelCounts = createPixelCounts(nonDsComponentsPixel);
                for (let i = 0, n = bitmap.length; i < n; i++) {
                    const pixelAsNumber = bitmap[i];
                    if (pixelAsNumber === undefined) {
                        throw new Error(`No pixel at ${i} (this should be a TS-only protection)`);
                    }
                    pixelCounts[pixelAsNumber]++;
                }

                // if (printAsciiArt) {
                //     logBitmap({
                //         logger,
                //         bitmap,
                //         width: getRectProperty(elementRect, 'width'),
                //     });
                // }

                const event: CountPixelsWorkerEvent = {
                    status: 'complete',
                    data: {
                        pixelCounts,
                        // Tells the consumer what numbers have been used for every component name, useful to
                        // post-process the bitmap independently
                        pixelByComponentName,

                        // Tells the consumer what number has been used for the non-DS components pixels, useful to
                        // post-process the bitmap independently
                        nonDsComponentsPixel,

                        // It's returned when passed with `returnBitmap: true`
                        bitmap: returnBitmap ? bitmap : null,
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
