import type { DsVisualCoverageDeNormalizedResult, DsVisualCoverageResult } from '../types';

type Params = {
    debugInfo: string;
    result: DsVisualCoverageResult;
    coverageContainerAttributeValue: string | null;
};

export function getDenormalizedCoverageResult(params: Params): DsVisualCoverageDeNormalizedResult {
    const {
        debugInfo,
        coverageContainerAttributeValue,
        result,
        result: { pixelCounts, duration, pixelByComponentName, nonDsComponentsPixel },
    } = params;

    // `pixelByComponentName` is something like
    // {
    //   Heading: 1, <-- each number represents the pixel used in the bitmap and also the index in `pixelCounts`
    //   Button: 2,
    //   Dropdown: 3
    // }
    //
    // `pixelCounts` is something like
    // [
    //   <numbers of empty pixels>,
    //   <numbers of Heading pixels>,
    //   <numbers of Button pixels>,
    //   <numbers of Dropdown pixels>,
    //   <numbers of non-DS component pixels>
    // ]
    //
    // and `readablePixelCounts` will be
    // {
    //   emptyPixel: <numbers of empty pixels>,
    //   Heading: <numbers of Heading pixels>,
    //   Button: <numbers of Button pixels>,
    //   Dropdown: <numbers of Dropdown pixels>,
    //   nonDsComponents: <numbers of non-DS component pixels>
    // }

    const componentNameByPixel = Object.entries(pixelByComponentName).reduce<
        Record<number, string>
    >((acc, [index, value]) => {
        acc[value] = index;
        return acc;
    }, {});

    let dsComponentPixels = 0;

    const readablePixelCounts = {
        nonDsComponents: pixelCounts[nonDsComponentsPixel] ?? 0,
        ...pixelCounts.reduce<Record<string, number>>((acc, pixelCount, index) => {
            // 0 is for the empty pixels
            if (index === 0) {
                acc.emptyPixel = pixelCount;
                return acc;
            }

            const componentName = componentNameByPixel[index];

            // Happens in the nonDsComponentsPixel case
            if (!componentName) return acc;

            acc[componentName] = pixelCount;
            dsComponentPixels += pixelCount;
            return acc;
        }, {}),
    };

    const coverage =
        (dsComponentPixels / (dsComponentPixels + readablePixelCounts.nonDsComponents)) * 100;

    const totalDuration = Object.values<number>(duration).reduce<number>(
        (acc, item) => acc + item,
        0,
    );

    return {
        ...result,

        coverage,
        debugInfo,
        totalDuration,
        readablePixelCounts,
        coverageContainerAttributeValue,
    };
}
