export function lazySingleton<T>(loader: () => Promise<T>): () => Promise<T> {
    let promise: Promise<T> | undefined;
    return () => {
        if (!promise) promise = loader();
        return promise;
    };
}
