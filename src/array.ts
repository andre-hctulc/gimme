import { GimmeError, GimmeTypeError } from "./error";
import { Gimme, InferType, Spawner } from "./gimme";

export class GimmeArray<T extends Gimme<any>> extends Gimme<InferType<T>[]> {
    private _itemsSchema: Gimme<InferType<T>, boolean, boolean>;

    constructor(items: Gimme<InferType<T>, boolean, boolean>) {
        super(items);
        this._itemsSchema = items;
    }

    protected spawn(refiner: Spawner<InferType<T>[]>): void {
        refiner((data) => {
            if (!Array.isArray(data))
                throw new GimmeTypeError("Array", GimmeTypeError.typeof(data), {
                    userMessage: "Expected list of values",
                });
            data.forEach((it) => this._itemsSchema.p(it));
            return data;
        });
    }

    maxLen(max: number) {
        return this.refine((data, c, skip) => {
            if (data.length > max) throw new GimmeError({ message: "Too many items. Max: " + max });
            return data;
        });
    }

    minLen(min: number) {
        return this.refine((data, c, skip) => {
            if (data.length < min) throw new GimmeError({ message: "Too less items. Min: " + min });
            return data;
        });
    }

    len(len: number) {
        return this.refine((data, c, skip) => {
            if (data.length !== len) throw new GimmeError({ message: "Expected " + len + " items" });
            return data;
        });
    }
}
