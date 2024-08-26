import { calculateCoverage } from '../core/calculateCoverage';
import { defaultPixelByPixelType } from '../core/constants';
import type {
    CoverageContainer,
    DsVisualCoverageDeNormalizedResult,
    DsVisualCoverageResult,
    Rect,
} from '../types';

type Params = {
    result: DsVisualCoverageResult;
    dsVisualCoverageContainerData: {
        elementRect: Rect;
        coverageContainer: CoverageContainer;
    };
};

export function getDenormalizedCoverageResult(params: Params): DsVisualCoverageDeNormalizedResult {
    const {
        result,
        result: { pixelCounts, duration },
        dsVisualCoverageContainerData,
    } = params;

    const readablePixelCounts = {
        emptyPixel: pixelCounts[defaultPixelByPixelType.emptyPixel] ?? 0,
        nonDsComponent: pixelCounts[defaultPixelByPixelType.nonDsComponent] ?? 0,
        uiDsComponent: pixelCounts[defaultPixelByPixelType.uiDsComponent] ?? 0,
        layoutDsComponent: pixelCounts[defaultPixelByPixelType.layoutDsComponent] ?? 0,
        unknownDsComponent: pixelCounts[defaultPixelByPixelType.unknownDsComponent] ?? 0,
    };

    const coverage = calculateCoverage({ pixelCounts });

    const totalDuration = Object.values<number>(duration).reduce<number>(
        (acc, item) => acc + item,
        0,
    );

    return {
        ...result,

        coverage,
        totalDuration,
        readablePixelCounts,

        team: dsVisualCoverageContainerData.coverageContainer.team,
        component: dsVisualCoverageContainerData.coverageContainer.component,
    };
}
