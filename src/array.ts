import { GimmeAny } from "./any";
import { GimmeError, GimmeTypeError } from "./error";
import { Gimme } from "./gimme";

interface GimmeArrayArtefacts<T extends any[]> {}

export class GimmeArray<T extends any[]> extends Gimme<T, GimmeArrayArtefacts<T>> {
    constructor(items: Gimme<T[number]>) {
        super();
        this.refine((data) => {
            if (!Array.isArray(data)) throw new GimmeTypeError("array", data);
            return data as T;
        }, true);
        this.items(items);
    }

    maxLen(max: number) {
        return this.refine((data, c, skip) => {
            if ((data as T).length > max) throw new GimmeError("Too many items");
            return data as T;
        });
    }

    minLen(min: number) {
        return this.refine((data, c, skip) => {
            if ((data as T).length < min) throw new GimmeError("Too less items");
            return data as T;
        });
    }

    len(len: number) {
        return this.refine((data, c, skip) => {
            if ((data as T).length !== len) throw new GimmeError("Length mismatch");
            return data as T;
        });
    }

    items(gimme: Gimme<T[number]>) {
        return this.refine((data, c, skip) => {
            for (const item of data as T) {
                // throws errors
                gimme.parse(item);
            }
            return data as T;
        });
    }
}
