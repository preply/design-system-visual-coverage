import { createBitmap } from '../bitmap/createBitmap';
import { setBitmapPixel } from '../bitmap/setBitmapPixel';
import { getRectCoordinate } from '../rect/rectProperties';
import type { Rect, Bitmap, ChildData, PixelCounts, Milliseconds } from '../types';

import { createPixelCounts } from './createPixelCounts';

type Params = {
    elementRect: Rect;
    childrenData: ChildData[];
    offset: { top: number; left: number };
};

type CountPixelsResult = {
    bitmap: Bitmap;
    duration: Milliseconds;
    pixelCounts: PixelCounts;

    // Tells the consumer what numbers have been used for every component name, useful to
    // post-process the bitmap independently
    pixelByComponentName: Record<string, number>;

    // Tells the consumer what number has been used for the non-DS components pixels, useful to
    // post-process the bitmap independently
    nonDsComponentsPixel: number;
};

export function countPixels(params: Params): CountPixelsResult {
    const { offset, elementRect, childrenData } = params;

    const start: Milliseconds = Date.now();

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
        getRectCoordinate(elementRect, 'height'),
        getRectCoordinate(elementRect, 'width'),
        nonDsComponentsPixel,
    );

    for (let i = 0, n = childrenData.length; i < n; i++) {
        const childData = childrenData[i];
        if (!childData)
            throw new Error(`No childData at ${i} (this should be a TS-only protection)`);

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

        const rectTop = getRectCoordinate(rect, 'top');
        const rectLeft = getRectCoordinate(rect, 'left');
        const rectWidth = getRectCoordinate(rect, 'width');
        const rectHeight = getRectCoordinate(rect, 'height');
        const rowLength = getRectCoordinate(elementRect, 'height');
        const columnLength = getRectCoordinate(elementRect, 'width');

        if (childData.weight === undefined) {
            throw new Error(`No weight for ${elementRect} (this should be a TS-only protection)`);
        }

        for (let weightLine = 0; weightLine < childData.weight; weightLine++) {
            // "Draw" the rows in bitmap
            const top = Math.floor(rectTop - offsetTop + weightLine);
            const bottom = Math.floor(rectTop - offsetTop + rectHeight - 1 - weightLine);

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
                    currentLeft >= rectLeft - offsetLeft + rectWidth || currentLeft >= columnLength;
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
                        width: getRectCoordinate(elementRect, 'width'),
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
                        width: getRectCoordinate(elementRect, 'width'),
                    });
                }
            }

            // "Draw" the columns in bitmap
            const left = Math.floor(rectLeft - offsetLeft + weightLine);
            const right = Math.floor(rectLeft - offsetLeft + rectWidth - 1 - weightLine);
            for (let currentTop = Math.floor(rectTop - offsetTop); ; currentTop++) {
                // Happens when the weight is higher than half the height of the element, and so top and bottom flip. Look at noMoreHorizontalLinesToDraw's comment
                const noMoreVerticalLinesToDraw = left > right;
                if (noMoreVerticalLinesToDraw) break;

                // This is the loop condition, here it's more readable
                const isAtTheBottomOfTheViewport =
                    currentTop >= rectTop - offsetTop + rectHeight - 1 || currentTop > rowLength;

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
                        width: getRectCoordinate(elementRect, 'width'),
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
                        width: getRectCoordinate(elementRect, 'width'),
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

    return {
        bitmap,
        pixelCounts,
        nonDsComponentsPixel,
        pixelByComponentName,
        duration: Date.now() - start,
    };
}
