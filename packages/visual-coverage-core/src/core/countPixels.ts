import { createBitmap } from '../bitmap/createBitmap';
import { logBitmap } from '../bitmap/logBitmap';
import { setBitmapPixel } from '../bitmap/setBitmapPixel';
import { getRectCoordinate } from '../rect/rectProperties';
import type {
    Bitmap,
    ChildData,
    ComponentType,
    Logger,
    Milliseconds,
    PixelByPixelType,
    PixelCounts,
    Rect,
    WeightByComponentName,
} from '../types';

import { createPixelCounts } from './createPixelCounts';

type Params = {
    logger: Logger;
    elementRect: Rect;
    printAsciiArt: boolean;
    childrenData: ChildData[];
    pixelByPixelType: PixelByPixelType;
    offset: { top: number; left: number };
    weightByComponentName: WeightByComponentName;
};

type CountPixelsResult = {
    bitmap: Bitmap;
    pixelCounts: PixelCounts;
    duration: Milliseconds;
};

export function countPixels(params: Params): CountPixelsResult {
    const {
        logger,
        offset,
        elementRect,
        childrenData,
        printAsciiArt,
        pixelByPixelType,
        weightByComponentName,
    } = params;

    const start: Milliseconds = Date.now();

    const bitmap = createBitmap(
        getRectCoordinate(elementRect, 'height'),
        getRectCoordinate(elementRect, 'width'),
    );

    for (let i = 0, n = childrenData.length; i < n; i++) {
        const childData = childrenData[i];
        if (!childData)
            throw new Error(`No childData at ${i} (this should be a TS-only protection)`);

        const { rect, dsComponentType, isChildOfUiDsComponent, dsComponentName } = childData;

        const adjustedSsComponentType: ComponentType = isChildOfUiDsComponent
            ? 'unknownDsComponent' // children of ui components are treated as DS components too
            : dsComponentType;

        const pixel = pixelByPixelType[adjustedSsComponentType];

        const offsetTop = offset.top;
        const offsetLeft = offset.left;

        const rectTop = getRectCoordinate(rect, 'top');
        const rectLeft = getRectCoordinate(rect, 'left');
        const rectWidth = getRectCoordinate(rect, 'width');
        const rectHeight = getRectCoordinate(rect, 'height');
        const rowLength = getRectCoordinate(elementRect, 'height');
        const columnLength = getRectCoordinate(elementRect, 'width');

        const weight = weightByComponentName[dsComponentName ?? 'nonDsComponent'];

        if (weight === undefined) {
            throw new Error(`No weight for ${elementRect} (this should be a TS-only protection)`);
        }

        for (let weightLine = 0; weightLine < weight; weightLine++) {
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
            width: getRectCoordinate(elementRect, 'width'),
        });
    }

    return {
        bitmap,
        pixelCounts,
        duration: Date.now() - start,
    };
}
