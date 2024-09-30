import { svgRendererAttributeName } from '@preply/ds-visual-coverage-core';

export function removeSvgRenderers(): void {
    const svrRenderers = globalThis.document.querySelectorAll(`[${svgRendererAttributeName}]`);
    for (let i = 0, n = svrRenderers.length; i < n; i++) {
        const domElement = svrRenderers[i];
        domElement?.remove();
    }
}
