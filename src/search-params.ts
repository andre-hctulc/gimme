import { GimmeTypeError } from "./error";
import { Gimme, Refiner } from "./gimme";

export class GimmeSearchParams<T extends Record<string, Gimme<any>>> extends Gimme<URLSearchParams> {
    private _paramsSchema: T;

    constructor(params: T) {
        super(params);
        this._paramsSchema = params;
    }

    protected spawn(refine: (refiner: Refiner<URLSearchParams>) => void): void {
        refine((data, coerce) => {
            if (!(data instanceof URLSearchParams)) throw new GimmeTypeError("URLSearchParams", data);
            const newParams = new URLSearchParams();
            // validate props
            for (const key in this._paramsSchema) {
                // validate field
                const parsedData = this._paramsSchema[key].parse(data.get(key));
                // Only set keys if explicitly defined in data
                if (data.has(key)) newParams.append(key, parsedData);
            }
            return newParams as any;
        });
    }

    maxProps(max: number) {
        return this.refine((data) => {
            if (Array.from((data as URLSearchParams).keys()).length > max)
                throw new Error("Too many entries");
            return data as any;
        });
    }

    minProps(min: number) {
        return this.refine((data) => {
            if (Array.from((data as URLSearchParams).keys()).length < min)
                throw new Error("Too less entries");
            return data as any;
        });
    }
}
