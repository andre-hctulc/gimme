import { GimmeTypeError } from "./error";
import { Gimme, Spawner } from "./gimme";

export class GimmeSearchParams<T extends Record<string, Gimme<any>>> extends Gimme<URLSearchParams> {
    private _paramsSchema: T;

    constructor(params: T) {
        super(params);
        this._paramsSchema = params;
    }

    protected spawn(refine: Spawner<URLSearchParams>): void {
        refine((data, coerce) => {
            if (coerce && data && typeof data === "object" && !Array.isArray(data)) {
                data = new URLSearchParams(data as Record<string, any>);
            }
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
            if (Array.from(data.keys()).length > max) throw new Error("Too many entries");
            return data as any;
        });
    }

    minProps(min: number) {
        return this.refine((data) => {
            if (Array.from(data.keys()).length < min) throw new Error("Too less entries");
            return data as any;
        });
    }

    protected merge(value1: URLSearchParams, value2: URLSearchParams): URLSearchParams {
        const newParams = new URLSearchParams(value1);
        Array.from(value2.entries()).forEach(([key, val]) => newParams.append(key, val));
        return newParams;
    }
}
