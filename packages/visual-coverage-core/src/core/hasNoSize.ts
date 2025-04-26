import { getRectCoordinate } from '../rect/rectProperties';
import type { Rect } from '../types';

type Params = {
    rect: Rect;
};

export function hasNoSize({ rect }: Params): boolean {
    return getRectCoordinate(rect, 'width') === 0 || getRectCoordinate(rect, 'height') === 0;
}
