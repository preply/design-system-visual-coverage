import { ChildData, getRectCoordinate } from '@preply/ds-visual-coverage-core';

type LoopParams = {
    childrenData: ChildData[];
    svgRenderer: SVGSVGElement;
};

export function addSvgRectangles(params: LoopParams): void {
    const { svgRenderer, childrenData } = params;

    // SVGs do not support inner border. So multiple rectangles are drawn to simulate it
    for (let i = 0, n = childrenData.length; i < n; i++) {
        const childData = childrenData[i];
        if (!childData)
            throw new Error(`No childData at ${i} (this should be a TS-only protection)`);

        const { rect, weight, debugInfo, dsComponentName, debugColor } = childData;

        // Be aware that the weight could be 0! In that case, the SVG is added to the DOM but it's not visible

        // Create an SVG group for each child data
        const svgGroup = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svgGroup.setAttribute('data-rect', JSON.stringify(rect));
        svgGroup.setAttribute('data-weight', weight.toString());
        svgGroup.setAttribute('data-debugInfo', JSON.stringify(debugInfo));
        svgGroup.setAttribute('data-dscomponentname', dsComponentName ?? 'null');

        for (let j = 0; j < weight; j++) {
            const width = getRectCoordinate(rect, 'width') - j * 2;
            const height = getRectCoordinate(rect, 'height') - j * 2;
            if (width < 0 || height < 0) {
                continue;
            }

            const svgRect = globalThis.document.createElementNS(
                'http://www.w3.org/2000/svg',
                'rect',
            );

            // `offset` is not considered because the svg should be placed at the top-left corner of the viewport
            svgRect.setAttribute('y', (getRectCoordinate(rect, 'top') + j).toString());
            svgRect.setAttribute('x', (getRectCoordinate(rect, 'left') + j).toString());
            svgRect.setAttribute('width', width.toString());
            svgRect.setAttribute('height', height.toString());

            svgRect.setAttribute('opacity', '0.3');
            svgRect.setAttribute('fill', 'none');

            svgRect.setAttribute('stroke-width', '1'); // to make it more visible
            svgRect.setAttribute('stroke', debugColor.toString());

            svgGroup.appendChild(svgRect);
        }

        // Append the group for this child data to the svgRenderer
        svgRenderer.appendChild(svgGroup);
    }
}
