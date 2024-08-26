type DOMHighResTimeStamp = number;

export interface IdleDeadline {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/IdleDeadline/didTimeout) */
    didTimeout: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/IdleDeadline/timeRemaining) */
    timeRemaining(): DOMHighResTimeStamp;
}

interface IdleRequestCallback {
    (deadline: IdleDeadline): void;
}
interface IdleRequestOptions {
    timeout?: number;
}
export type RequestIdleCallback = (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
) => number;

export function getRequestIdleCallback(): RequestIdleCallback {
    if (!('requestIdleCallback' in globalThis))
        throw new Error('requestIdleCallback is not supported in this environment');

    // If TS says this @ts-expect-error is unused, simply remove ALL this module.
    // I purposefully disable the linting rule for the very first implementation to push it out of the door.
    // If you carefully read it, it does not hurt at runtime (but I hate to ignore rules, so I will remove it later on).
    // @ts-ignore I need to use ts-ignore instead of ts-expect-error, because I have issues in the CLI but in the IDE it works fine. I will fix it later on
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return globalThis.requestIdleCallback as RequestIdleCallback;
}
