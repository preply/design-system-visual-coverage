import type { ComponentNames } from '@preply/ds-visual-coverage-component-names';

import { coverageContainerDomAttributeName } from './core/constants';

export type CoverageContainer<TEAM extends string = string, COMPONENT extends string = string> = {
    team: TEAM;
    component: COMPONENT;

    ignore?: boolean;
};

/**
 * The attribute that mark an element as a candidate for the DS visual coverage.
 * TODO: move it to web package
 */
export type CoverageContainerDomAttributeName = typeof coverageContainerDomAttributeName;
export type CoverageContainerDomAttributeValue = string;

/**
 * Virtual representation of the pixels of the page. Its length is the page's width*height
 * and contains one pixel marker for each page's pixel. The pixel markers are used to identify the
 * type of component.
 *
 * @example This could be the content of a 10x10 pixel page with a header and a button.
 * [
 *   0,1,1,1,1,1,1,1,1,1,0,
 *   0,1,0,0,0,0,0,0,0,1,0,
 *   0,1,1,1,1,1,1,1,1,1,0,
 *   0,0,0,0,0,0,0,0,0,0,0,
 *   0,0,0,0,0,4,4,4,4,4,0,
 *   0,0,0,0,0,4,0,0,0,4,0,
 *   0,0,0,0,0,4,4,4,4,4,0,
 *   0,0,0,0,0,0,0,0,0,0,0,
 *   0,0,0,0,0,0,0,0,0,0,0,
 *   0,0,0,0,0,0,0,0,0,0,0,
 * ]
 */
export type Bitmap = Uint8Array;

export type EmptyPixel = 0;
export type NonDsComponentPixel = 1;
export type DsComponentPixels = 2 | 3 | 4;
export type ComponentPixels = NonDsComponentPixel | DsComponentPixels;
export type Pixel = EmptyPixel | ComponentPixels;
export type HighestNumber = 4;

export type ComponentType =
    | 'nonDsComponent' // A component that does not belong to the DS
    | 'uiDsComponent' // A DS component that doesn't have any children
    | 'layoutDsComponent' // A DS container component (ex. FlexLayout, GridLayout, Box, etc.)
    | 'unknownDsComponent'; // A DS component that is not recognized

export type PixelType = 'emptyPixel' | ComponentType;

export type DsVisualCoverageResult = {
    stopped: boolean;
    duration: Duration;
    pixelCounts: PixelCounts;

    // top and left are absolute to the page
    elementRect: Rect;
};

type Percentage = number;
export type Coverage = Percentage;

export type DsVisualCoverageDeNormalizedResult = DsVisualCoverageResult & {
    team: string;
    component: string;
    coverage: Coverage;
    totalDuration: Milliseconds;
    readablePixelCounts: Record<PixelType, number>;
};

export type DsVisualCoverageRunResult = {
    stopped: boolean;
    totalDuration: Milliseconds;
    dsVisualCoverageResults: DsVisualCoverageDeNormalizedResult[];
};

export type Logger = (...args: unknown[]) => void;

export type PixelCounts = Uint32Array;

export type Coordinates = {
    // top and left are absolute to the page
    top: number;
    left: number;
    width: number;
    height: number;
};

export type TopLeftWidthHeight = Uint16Array;
export type Rect = TopLeftWidthHeight;
export type Milliseconds = number;

export type Duration = {
    blockingDuration: Milliseconds;
    nonBlockingDuration: Milliseconds;

    countPixelsDuration: Milliseconds;
    loopOverDomChildrenDuration: Milliseconds;
};

// see https://x.com/mattpocockuk/status/1823380970147369171
type LooseAutocomplete<T extends string> = T | (string & {});

export type ChildData = {
    rect: Rect;
    componentData: string;
    dsComponentType: ComponentType;
    isChildOfUiDsComponent: boolean;
    dsComponentName: LooseAutocomplete<ComponentNames> | null;
};

export type RgbColor = string;
export type ReadableChar = string;

export type WeightByComponentName = Record<
    'emptyPixel' | 'nonDsComponent' | 'unknownDsComponent' | ComponentNames,
    number
>;
export type PixelByPixelType = Record<PixelType, Pixel>;
export type ColorByPixelType = Record<PixelType, RgbColor>;
export type ReadableCharByPixel = Record<Pixel, ReadableChar>;
