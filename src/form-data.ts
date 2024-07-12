import { GimmeTypeError } from "./error";
import { Gimme, Refiner } from "./gimme";

export class GimmeFormData<T extends Record<string, Gimme<any>>> extends Gimme<FormData> {
    private _entriesSchema: T;

    constructor(entries: T) {
        super(entries);
        this._entriesSchema = entries;
    }

    protected spawn(refine: (refiner: Refiner<FormData>) => void): void {
        refine((data, coerce) => {
            if (!(data instanceof FormData)) throw new GimmeTypeError("FormData", data);
            const newFd = new FormData();
            // validate props
            for (const key in this._entriesSchema) {
                // validate field
                const parsedData = this._entriesSchema[key].parse(data.get(key));
                if (data.has(key)) newFd.append(key, parsedData);
            }
            return newFd as any;
        });
    }

    maxProps(max: number) {
        return this.refine((data) => {
            if (Array.from((data as FormData).keys()).length > max) throw new Error("Too many entries");
            return data as any;
        });
    }

    minProps(min: number) {
        return this.refine((data) => {
            if (Array.from((data as FormData).keys()).length < min) throw new Error("Too less entries");
            return data as any;
        });
    }
}
