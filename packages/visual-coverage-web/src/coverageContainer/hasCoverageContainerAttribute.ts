import { coverageContainerDomAttribute } from '../core/constants';

export function hasCoverageContainerAttribute(child: Element): boolean {
    const dataCoverageHtmlAttribute = child.getAttribute(coverageContainerDomAttribute);
    return dataCoverageHtmlAttribute !== null;
}
