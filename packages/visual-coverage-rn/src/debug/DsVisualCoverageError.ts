export type StopReason = 'unknownStopReason';

type DsVisualCoverageData = {
    team: string;
    component: string;
    stopReason: StopReason;
};
export class DsVisualCoverageError extends Error {
    public team: string;
    public component: string;
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
        this.component = dsVisualCoverageData.component;
        this.stopReason = dsVisualCoverageData.stopReason;
    }
}
