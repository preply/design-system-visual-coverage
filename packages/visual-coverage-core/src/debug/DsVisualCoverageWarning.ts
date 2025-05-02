type DsVisualCoverageData = {
    warning: string;
    debugInfo: string;
};
export class DsVisualCoverageWarning extends Error {
    public platform: string;
    public warning: string;
    public debugInfo: string;

    constructor(params: {
        dsVisualCoverageData: DsVisualCoverageData;
        platform: string;
        message: string;
    }) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(params.message);

        // Custom debugging information
        this.platform = params.platform;

        this.warning = params.dsVisualCoverageData.warning;
        this.debugInfo = params.dsVisualCoverageData.debugInfo;
    }
}
