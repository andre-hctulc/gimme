import { GimmeError, GimmeTypeError } from "./error";
import { Gimme, InferType } from "./gimme";

export class GimmeArray<T extends Gimme<any>> extends Gimme<InferType<T>[]> {
    constructor(items: Gimme<InferType<T>>) {
        super();
        this.spawn((data) => {
            if (!Array.isArray(data)) throw new GimmeTypeError("array", data);
            return data as InferType<T>[];
        });
        this.items(items, false);
    }

    maxLen(max: number) {
        return this.refine((data, c, skip) => {
            if ((data as InferType<T>[]).length > max) throw new GimmeError("Too many items");
            return data as InferType<T>[];
        });
    }

    minLen(min: number) {
        return this.refine((data, c, skip) => {
            if ((data as InferType<T>[]).length < min) throw new GimmeError("Too less items");
            return data as InferType<T>[];
        });
    }

    len(len: number) {
        return this.refine((data, c, skip) => {
            if ((data as InferType<T>[]).length !== len) throw new GimmeError("Length mismatch");
            return data as InferType<T>[];
        });
    }

    items(gimme: Gimme<InferType<T>>, copy = true) {
        return this.refine(
            (data, c, skip) => {
                for (const item of data as InferType<T>[]) {
                    // throws errors
                    gimme.parse(item);
                }
                return data as InferType<T>[];
            },
            false,
            copy
        );
    }
}
