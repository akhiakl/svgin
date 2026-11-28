import { useRef } from 'react';

// Latest value without becoming an effect dependency (consumers pass fresh inline closures).
export function useLatestRef<T>(value: T): { current: T } {
    const ref = useRef(value);
    ref.current = value;
    return ref;
}
