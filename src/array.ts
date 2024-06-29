import { GimmeError, GimmeTypeError } from "./error";
import { Gimme, InferType, Refine } from "./gimme";

export class GimmeArray<T extends Gimme<any>> extends Gimme<InferType<T>[]> {
    private _itemsSchema: Gimme<InferType<T>>;

    constructor(items: Gimme<InferType<T>>) {
        super(items);
        this._itemsSchema = items;
    }

    protected spawn(refine: (refiner: Refine<InferType<T>[]>) => void): void {
        refine((data) => {
            if (!Array.isArray(data)) throw new GimmeTypeError("array", data);
            data.forEach((it) => this._itemsSchema.parse(it));
            return data as InferType<T>[];
        });
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
}
