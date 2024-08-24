import type { Coordinates, Rect, TopLeftWidthHeight } from '../types';

export function getRectCoordinate(
    rect: Rect,
    property: 'top' | 'left' | 'width' | 'height',
): number {
    if (property === 'top') return rect[0] ?? 0;
    if (property === 'left') return rect[1] ?? 0;
    if (property === 'width') return rect[2] ?? 0;
    if (property === 'height') return rect[3] ?? 0;

    throw new Error(`Invalid property: ${property}`);
}

export function getRectCoordinates(rect: Rect): Coordinates {
    return {
        top: rect[0] ?? 0,
        left: rect[1] ?? 0,
        width: rect[2] ?? 0,
        height: rect[3] ?? 0,
    };
}

export function setRectCoordinate(
    mutableRect: Rect,
    property: 'top' | 'left' | 'width' | 'height',
    value: number,
): void {
    if (property === 'top') mutableRect[0] = value;
    if (property === 'left') mutableRect[1] = value;
    if (property === 'width') mutableRect[2] = value;
    if (property === 'height') mutableRect[3] = value;
}

export function createEmptyRect(): TopLeftWidthHeight {
    return new Uint16Array(4);
}

export function createRect({
    top,
    left,
    width,
    height,
}: {
    top: number;
    left: number;
    width: number;
    height: number;
}): TopLeftWidthHeight {
    const rect = createEmptyRect();

    // elements outside of the viewport have negative values (it happened with the navbar of the react native sandbox)
    rect[0] = top > 0 ? Math.floor(top) : 0;
    rect[1] = left > 0 ? Math.floor(left) : 0;

    rect[2] = Math.floor(width);
    rect[3] = Math.floor(height);

    return rect;
}
