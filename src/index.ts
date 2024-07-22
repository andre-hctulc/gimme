import { GimmeAny } from "./any";
import { GimmeArray } from "./array";
import { GimmeBlob } from "./blob";
import { GimmeBool } from "./boolean";
import { GimmeFormData } from "./form-data";
import { GimmeFunc } from "./function";
import { Gimme, InferType } from "./gimme";
import { GimmeNumber } from "./number";
import { GimmeObject } from "./object";
import { GimmeSearchParams } from "./search-params";
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
    /** string */
    export const str = () => new GimmeString();
    /** number */
    export const num = () => new GimmeNumber();
    /** boolean */
    export const bool = () => new GimmeBool();
    /** object */
    export const obj = <T extends Record<string, Gimme<any, boolean, boolean>>>(props: T) =>
        new GimmeObject(props);
    /** Array */
    export const arr = <T extends Gimme<any, boolean, boolean>>(items: T) => new GimmeArray<T>(items);
    /** Function */
    export const func = () => new GimmeFunc();
    /** any */
    export const any = () => new GimmeAny();
    /** Symbol */
    export const sym = () => new GimmeSymbol();
    /** Blob */
    export const blob = () => new GimmeBlob();
    /** FormData */
    export const fd = <T extends Record<string, Gimme<any, boolean, boolean>>>(props: T) =>
        new GimmeFormData(props);
    /** URLSearchParams */
    export const search = <T extends Record<string, Gimme<any, boolean, boolean>>>(props: T) =>
        new GimmeSearchParams(props);

    export type Infer<T extends Gimme<any, boolean, boolean>> = InferType<T>;
}

export default gimme;
