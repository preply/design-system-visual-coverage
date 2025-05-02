import { DsVisualCoverageRunResult, getRectCoordinates } from '@preply/ds-visual-coverage-core';
import { nullAttributeValue } from '../constants';
import { addSvgRectangles } from './addSvgRectangles';

type Params = {
    result: DsVisualCoverageRunResult;
    svgRendererAttributeName: string;
};

export function visualizeCoverage(params: Params) {
    const { result, svgRendererAttributeName } = params;

    result.dsVisualCoverageResults.forEach(r => {
        const { top, left, width, height } = getRectCoordinates(r.elementRect);

        // By passing an svg, the element's rect will be added there and we can visualize them by adding the svg to the page
        const svgRenderer = globalThis.document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        svgRenderer.setAttribute('width', (left + width).toString());
        svgRenderer.setAttribute('height', (top + height).toString());
        svgRenderer.style.position = 'absolute';
        svgRenderer.style.zIndex = '2147483647'; // That's 32-bit integer max value, see https://stackoverflow.com/a/491105
        svgRenderer.style.top = '0';
        svgRenderer.style.left = '0';
        svgRenderer.style.pointerEvents = 'none';
        svgRenderer.setAttribute(
            svgRendererAttributeName,
            r.coverageContainerAttributeValue ?? nullAttributeValue,
        );

        globalThis.document.body.appendChild(svgRenderer);
        addSvgRectangles({
            svgRenderer,
            childrenData: r.childrenData,
        });
    });
}
