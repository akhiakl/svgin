// A counter is enough: a collision only makes two icons share a gradient, which is cosmetic.
let counter = 0;

export function nextInstanceId(): string {
    return `svgin${counter++}`;
}
