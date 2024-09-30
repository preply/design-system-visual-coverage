export function supportWorkersFromString(): boolean {
    return !!(globalThis.Blob && globalThis.URL && globalThis.Worker);
}
