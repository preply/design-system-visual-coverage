import { createLogger } from './debug/createLogger';

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
export type Bitmap = Uint8Array | Uint16Array | Uint32Array;

export type EmptyPixel = 0;
export type Pixel = number;

export type Warning =
    | 'doesNotContainChildren'
    | 'zeroTotalPixels'
    | 'onlyEmptyPixels'
    | 'hasNoSize';

export type DsVisualCoverageResult = {
    duration: Duration;
    warnings: Warning[];
    childrenData: ChildData[];

    pixelCounts: PixelCounts;
    // Tells the consumer what numbers have been used for every component name, useful to
    // post-process the bitmap independently
    pixelByComponentName: Record<string, number>;
    // Tells the consumer what number has been used for the non-DS components pixels, useful to
    // post-process the bitmap independently
    nonDsComponentsPixel: number;

    // top and left are absolute to the page
    elementRect: Rect;
};

type Percentage = number;
export type Coverage = Percentage;

export type CoverageContainer = string;

export type DsVisualCoverageDeNormalizedResult = DsVisualCoverageResult & {
    coverage: Coverage;
    debugInfo: string;
    totalDuration: Milliseconds;
    readablePixelCounts: Record<string, number>;
    coverageContainerAttributeValue: string | null;
};

export type DsVisualCoverageRunResult = {
    stopped: boolean;
    totalDuration: Milliseconds;
    dsVisualCoverageResults: DsVisualCoverageDeNormalizedResult[];
};

export type Logger = ReturnType<typeof createLogger>;

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

export type ChildData = {
    rect: Rect;

    weight: number;
    dsComponentName: string | null;

    // Any relevant information that eases debugging the result. Typically, it includes a
    // stringified version of the DOM element on Web, or `testID` on React Native. It's assigned as
    // an attribute to the colored SVGs of the preview to quickly link the React with the Child that
    // generated it
    debugInfo: string;
    debugColor: ComponentColor;
};

// The list is purposefully limited by the list of square emojis (🟥🟧🟨🟩🟦🟪🟫). So the same
// color will be used in the SVG rectangles and on the bitmap.
// Black and white are used for empty pixels (the background) based on the theme.
export type ComponentColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'brown';

export type GetComponentData<COMPONENT = unknown> = (params: {
    component: COMPONENT;
    parentsData: ChildData[];
}) => GetComponentDataResult;

type GetComponentDataResult =
    | {
          result: 'ignoreComponent';
      }
    | ({
          result: 'countComponent';
      } & Omit<ChildData, 'rect'>);

export type GetContainerData<COMPONENT = unknown> = (params: {
    component: COMPONENT;
}) => GetContainerDataResult;

type GetContainerDataResult =
    | {
          result: 'isNotCoverageContainer';
      }
    | {
          result: 'isCoverageContainer';
          coverageContainer: CoverageContainer;
      }
    | {
          /**
           * The container will be completely ignored by the DS coverage. It's useful to exclude
           * some third parties UIs.
           */
          result: 'ignoreCoverageContainer';
          coverageContainer: CoverageContainer;
      };
