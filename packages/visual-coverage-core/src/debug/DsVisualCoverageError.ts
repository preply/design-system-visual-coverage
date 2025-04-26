export type StopReason = 'unknownStopReason';

export class DsVisualCoverageError extends Error {
    public platform: string;
    public debugInfo: string;
    public stopReason: StopReason | string;

    constructor(params: {
        message: string;
        platform: string;
        debugInfo: string;
        stopReason: StopReason | string;
    }) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(params.message);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DsVisualCoverageError);
        }

        // Custom debugging information
        this.platform = params.platform;
        this.debugInfo = params.debugInfo;
        this.stopReason = params.stopReason;
    }
}
