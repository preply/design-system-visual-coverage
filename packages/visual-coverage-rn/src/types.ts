import type {
    AppComponentNames,
    ComponentNames,
    DsCandidateComponentNames,
} from '@preply/ds-visual-coverage-component-names';
import type { CoverageContainer, DsVisualCoverageRunResult } from '@preply/ds-visual-coverage-core';

import type { coverageTestIdSeparator } from './hooks/getCoverageTestId';
import type { coverageContainerTestIdSeparator } from './hooks/useCoverageContainerTestId';
import type { dsComponentTestIdSeparator } from './hooks/useDsComponentTestId';

export type _RNComponentMeasurement = {
    coverageContainer: CoverageContainer;
    dsComponentName: ComponentNames | null;
    layout: {
        x: number;
        y: number;
        pageX: number;
        pageY: number;
    };
};

type EmptyString = string;
type StringifiedCoverageContainer = string;
type CoverageTestIdSeparator = typeof coverageTestIdSeparator;
type CoverageContainerTestIdSeparator = typeof coverageContainerTestIdSeparator;
type DsComponentTestIdSeparator = typeof dsComponentTestIdSeparator;
type RnTestId = string | EmptyString;

export type CoverageContainerTestIdSuffix =
    `${CoverageContainerTestIdSeparator}${StringifiedCoverageContainer}`;
type DsComponentTestIdSuffix = `${DsComponentTestIdSeparator}${
    | AppComponentNames
    | DsCandidateComponentNames}`;

export type AccessibilityIdentifier = RnTestId | CoverageTestId;

export type CoverageTestId = `${RnTestId}${CoverageTestIdSeparator}${
    | CoverageContainerTestIdSuffix
    | DsComponentTestIdSuffix}`;

export type ViewMeasurement = {
    top: number;
    left: number;
    width: number;
    height: number;
    // Swift's class
    instanceOf: string;
    accessibilityLabel: string;
    children: ViewMeasurements;
    accessibilityIdentifier: AccessibilityIdentifier;
};

export type ViewMeasurements = Array<ViewMeasurement>;

export type RootSwiftView = ViewMeasurement & {
    viewportWidth: number;
    viewportHeight: number;
};

export type OnError = (error: unknown) => void;
export type Logger = (...args: unknown[]) => void;
export type OnComplete = (dsVisualCoverageResult: DsVisualCoverageRunResult) => void;
export type ShouldIgnoreContainer = (
    dsVisualCoverageContainerAttribute: CoverageContainer,
) => boolean;
