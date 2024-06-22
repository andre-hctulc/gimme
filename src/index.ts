import { GimmeAny } from "./any";
import { GimmeArray } from "./array";
import { GimmeBool } from "./boolean";
import { GimmeFunc } from "./function";
import { Gimme, InferType } from "./gimme";
import { GimmeNumber } from "./number";
import { GimmeObject } from "./object";
import { GimmeString } from "./string";
import { GimmeSymbol } from "./symbol";

export {
    Gimme,
    GimmeAny,
    GimmeArray,
    GimmeBool,
    GimmeFunc,
    GimmeNumber,
    GimmeObject,
    GimmeString,
    GimmeSymbol,
};

export * from "./error";

namespace gimme {
    export const str = () => new GimmeString();
    export const num = () => new GimmeNumber();
    export const bool = () => new GimmeBool();
    export const obj = <T extends Record<string, Gimme<any>>>(props: T) => new GimmeObject(props);
    export const arr = <T extends Gimme<any>>(items: T) => new GimmeArray<T>(items);
    export const func = () => new GimmeFunc();
    export const any = () => new GimmeAny();
    export const sym = () => new GimmeSymbol();

    export type Infer<T extends Gimme<any>> = InferType<T>;
}

export default gimme;
