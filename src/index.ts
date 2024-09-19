import { GimmeAny } from "./any";
import { GimmeArray } from "./array";
import { GimmeBlob } from "./blob";
import { GimmeBool } from "./boolean";
import { GimmeFormData } from "./form-data";
import { GimmeFunc } from "./function";
import { Gimme, GimmeMap, InferType } from "./gimme";
import { GimmeNumber } from "./number";
import { GimmeObject } from "./object";
import { GimmeRecord } from "./record";
import { GimmeSearchParams } from "./search-params";
import { GimmeString } from "./string";
import { GimmeSymbol } from "./symbol";

export * from "./any";
export * from "./array";
export * from "./blob";
export * from "./boolean";
export * from "./form-data";
export * from "./function";
export * from "./gimme";
export * from "./number";
export * from "./object";
export * from "./record";
export * from "./search-params";
export * from "./string";
export * from "./symbol";
export * from "./error";

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
    export const obj = <T extends Record<string, Gimme>>(props: T) => new GimmeObject(props);
    /** Array */
    export const arr = <T extends Gimme>(items: T) => new GimmeArray<T>(items);
    /** Function */
    export const func = () => new GimmeFunc();
    /** any */
    export const any = () => new GimmeAny();
    /** Symbol */
    export const sym = () => new GimmeSymbol();
    /** Blob */
    export const blob = () => new GimmeBlob();
    /** FormData */
    export const fd = <T extends Record<string, Gimme>>(props: T) => new GimmeFormData(props);
    /** URLSearchParams */
    export const search = <T extends Record<string, Gimme>>(props: T) => new GimmeSearchParams(props);
    /** Record */
    export const rec = <T extends Gimme>(values: T) => new GimmeRecord(values);

    export type Infer<T extends Gimme | GimmeMap> = InferType<T>;
}

export default gimme;
