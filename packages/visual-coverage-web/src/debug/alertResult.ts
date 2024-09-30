import type { Milliseconds } from '@preply/ds-visual-coverage-core';

export function alertResult({
    coverage,
    component,
    blockingDuration,
    nonBlockingDuration,
}: {
    coverage: number;
    component: string;
    blockingDuration: Milliseconds;
    nonBlockingDuration: Milliseconds;
}): void {
    alert(
        `${component} - Coverage: ${coverage.toFixed(2)} % - blockingDuration: ${Math.ceil(
            blockingDuration,
        )} ms - nonBlockingDuration: ${Math.ceil(nonBlockingDuration)} ms`,
    );
}
