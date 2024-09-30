export function supportWorkersFromString() {
    return globalThis.Blob && globalThis.URL && globalThis.Worker;
}
