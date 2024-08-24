type CreatePromiseReturn<T = unknown> = {
    promise: Promise<T>;
    resolver: (value: T) => void;
    rejecter: (error: unknown) => void;
};

export function createPromise<T = unknown>(): CreatePromiseReturn<T> {
    let resolver: (value: T) => void = () => {};

    let rejecter: (error: unknown) => void = () => {};

    const promise = new Promise<T>((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
    });

    return { resolver, rejecter, promise };
}
