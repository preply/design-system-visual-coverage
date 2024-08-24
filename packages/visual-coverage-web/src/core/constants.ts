import type { ShouldIgnoreContainer } from '../types';

export const singleStepTimeout = 10_000;
export const coverageContainerDomAttribute = 'data-preply-ds-coverage';

export const defaultShouldIgnoreContainer: ShouldIgnoreContainer = coverageContainerAttribute =>
    !!coverageContainerAttribute.ignore;
