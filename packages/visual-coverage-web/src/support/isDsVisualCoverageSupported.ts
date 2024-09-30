import { getRequestIdleCallback } from './getRequestIdleCallback';
import { supportWorkersFromString } from './supportWorkersFromString';

type Result = 'yes' | 'noWorkerToStringSupport' | 'noRequestIdleCallback';

export function isDsVisualCoverageSupported(): Result {
    if (!supportWorkersFromString()) return 'noWorkerToStringSupport';

    try {
        getRequestIdleCallback();
    } catch {
        return 'noRequestIdleCallback';
    }

    return 'yes';
}
