import type { ShouldIgnoreContainer } from '../types';

export const defaultShouldIgnoreContainer: ShouldIgnoreContainer = coverageContainerAttribute =>
    !!coverageContainerAttribute.ignore;
