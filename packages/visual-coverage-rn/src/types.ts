import type {
    DsVisualCoverageError,
    DsVisualCoverageRunResult,
} from '@preply/ds-visual-coverage-core';

type EmptyString = string;
type RnTestId = string | EmptyString;
export type CoverageTestId = string;

export type AccessibilityIdentifier = RnTestId | CoverageTestId;

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

export type OnError = (error: DsVisualCoverageError) => void;
export type OnComplete = (dsVisualCoverageResult: DsVisualCoverageRunResult) => void;
