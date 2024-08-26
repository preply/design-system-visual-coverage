import { getRequestIdleCallback } from './getRequestIdleCallback';
import { supportWorkersFromString } from './supportWorkersFromString';

type Result = 'yes' | 'noWorkerToStringSupport' | 'noRequestIdleCallback';

export function isDsVisualCoverageSupported(): Result {
    if (!supportWorkersFromString()) return 'noWorkerToStringSupport';

    try {
        getRequestIdleCallback();
    } catch (error) {
        return 'noRequestIdleCallback';
    }

    return 'yes';
}
