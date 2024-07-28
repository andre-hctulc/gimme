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
            if (!Array.isArray(data)) throw new GimmeTypeError("Array", data);
            data.forEach((it) => this._itemsSchema.p(it));
            return data;
        });
    }

    maxLen(max: number) {
        return this.refine((data, c, skip) => {
            if (data.length > max) throw new GimmeError("Too many items");
            return data;
        });
    }

    minLen(min: number) {
        return this.refine((data, c, skip) => {
            if (data.length < min) throw new GimmeError("Too less items");
            return data;
        });
    }

    len(len: number) {
        return this.refine((data, c, skip) => {
            if (data.length !== len) throw new GimmeError("Length mismatch");
            return data;
        });
    }
}
