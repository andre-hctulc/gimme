import { GimmeTypeError } from "./error";
import { Gimme, Spawner } from "./gimme";

export class GimmeFormData<T extends Record<string, Gimme<any>>> extends Gimme<FormData> {
    private _entriesSchema: T;

    constructor(entries: T) {
        super(entries);
        this._entriesSchema = entries;
    }

    protected spawn(refine: Spawner<FormData>): void {
        refine((data, coerce) => {
            if (!(data instanceof FormData)) throw new GimmeTypeError("FormData", data);
            const newFd = new FormData();
            // validate props (We have to look at all entries of a single key!)
            for (const key in this._entriesSchema) {
                const entries = data.getAll(key);
                let values = entries.map((val, i) => {
                    const v = this._entriesSchema[key].parse(val);
                    return v;
                });
                if (!values.length) values = [this._entriesSchema[key].parse(null)];
                // Only set keys if explicitly defined in data
                if (data.has(key)) {
                    values.forEach((entry) => newFd.append(key, entry));
                }
            }
            return newFd as any;
        });
    }

    maxProps(max: number) {
        return this.refine((data) => {
            if (Array.from(data.keys()).length > max) throw new Error("Too many entries");
            return data;
        });
    }

    minProps(min: number) {
        return this.refine((data) => {
            if (Array.from(data.keys()).length < min) throw new Error("Too less entries");
            return data;
        });
    }

    protected merge(value1: FormData, value2: FormData): FormData {
        const newFd = new FormData();
        Array.from(value1.entries()).forEach(([key, val]) => newFd.append(key, val));
        Array.from(value2.entries()).forEach(([key, val]) => newFd.append(key, val));
        return newFd;
    }
}
