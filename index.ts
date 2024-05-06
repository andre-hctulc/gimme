import {
    GimmeAny,
    GimmeArray,
    GimmeBool,
    GimmeFunc,
    GimmeNumber,
    GimmeObject,
    GimmeString,
    GimmeSymbol,
    InferGimme,
} from "./gimme";
export type { InferGimme, InferType } from "./gimme";

export function string() {
    return new GimmeString();
}

export function number() {
    return new GimmeNumber();
}

export function bool() {
    return new GimmeBool();
}

export function object<T extends object>(props?: { [K in keyof T]: InferGimme<T[K]> }) {
    return new GimmeObject<T>(props);
}

export function array<T extends any[]>(items?: InferGimme<T[number]>) {
    return new GimmeArray<T>(items);
}

export function func() {
    return new GimmeFunc();
}

export function any() {
    return new GimmeAny();
}

export function symbol() {
    return new GimmeSymbol();
}
