// TODO: is this still useful?

const logger = {
    log(...args: unknown[]) {
        console.log(
            `%c DS Visual Coverage `,
            'background: #FFFFFF; color: #121117; padding: 2px; border-radius: 2px;',
            ...args,
        );
    },

    warn(...args: unknown[]) {
        console.log(
            `%c DS Visual Coverage `,
            'background: #966208; color: #121117; padding: 2px; border-radius: 2px;',
            ...args,
        );
    },

    error(...args: unknown[]) {
        console.log(
            `%c DS Visual Coverage `,
            'background: #A3120A; color: #121117; padding: 2px; border-radius: 2px;',
            ...args,
        );
    },
} as const;

const silentLogger = {
    log() {
        // logs nothing
    },

    warn() {
        // logs nothing
    },

    error() {
        // logs nothing
    },
};

export function createLogger(logIsEnabled: boolean) {
    return logIsEnabled ? logger : silentLogger;
}

export function isActiveLogger(maybeFakeLogger: unknown): boolean {
    return maybeFakeLogger === logger;
}
