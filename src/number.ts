import { GimmeTypeError } from "./error";
import { Gimme } from "./gimme";

export class GimmeNumber extends Gimme<number> {
    constructor() {
        super();
        this.refine((data, coerce) => {
            if (coerce) {
                const coerced = Number(data);
                if (isNaN(coerced)) throw new GimmeTypeError("number", data);
                return coerced;
            }

            if (typeof data !== "number") throw new GimmeTypeError("number", data);
            return data;
        }, true);
    }

    max(max: number) {
        return this.refine((data) => {
            if ((data as number) > max) throw new GimmeTypeError(`number <= ${max}`, data);
            return data as number;
        });
    }

    min(min: number) {
        return this.refine((data) => {
            if ((data as number) < min) throw new GimmeTypeError(`number >= ${min}`, data);
            return data as number;
        });
    }
}
