import { Logger } from '../types';

function logger(...args: unknown[]) {
    console.log(
        `%c Path coverage `,
        'background: #FF7AAC; color: #121117; padding: 2px; border-radius: 2px;',
        ...args,
    );
}

function silentLogger() {
    // Logs nothing...
}

export function createLogger(logIsEnabled: boolean): Logger {
    return logIsEnabled ? logger : silentLogger;
}

export function isActiveLogger(maybeFakeLogger: unknown): boolean {
    return maybeFakeLogger === logger;
}
