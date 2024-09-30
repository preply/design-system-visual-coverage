import type { StopReason as CountPixelsStopReason } from '../core/countPixels';
import type { StopReason as LoopOverDomChildrenStopReason } from '../core/loopOverDomChildren';

export type StopReason =
    | LoopOverDomChildrenStopReason
    | CountPixelsStopReason
    | 'unknownStopReason';

type DsVisualCoverageData = {
    team: string;
    component: string;
    userType: string;
    stopReason: StopReason;
};
export class DsVisualCoverageError extends Error {
    public team: string;
    public component: string;
    public userType: string;
    public stopReason: StopReason;

    constructor(dsVisualCoverageData: DsVisualCoverageData, message: string) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(message);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DsVisualCoverageError);
        }

        // Custom debugging information
        this.team = dsVisualCoverageData.team;
        this.userType = dsVisualCoverageData.userType;
        this.component = dsVisualCoverageData.component;
        this.stopReason = dsVisualCoverageData.stopReason;
    }
}
