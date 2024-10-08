import { GimmeError, GimmeTypeError } from "./error";
import { Gimme, InferType, Spawner } from "./gimme";

export class GimmeRecord<G extends Gimme> extends Gimme<Record<string, InferType<G>>> {
    private _valuesSchema: G;

    constructor(values: G) {
        super();
        this._valuesSchema = values;
    }

    protected spawn(refine: Spawner<Record<string, InferType<G>>>): void {
        refine((originalData) => {
            if (typeof originalData !== "object" || originalData === null) {
                throw new GimmeTypeError("object", GimmeTypeError.typeof(originalData), {
                    userMessage: "Expected an object",
                });
            }
            const keys = Object.keys(originalData);
            const data: Record<string, InferType<G>> = {};

            for (const key of keys) {
                try {
                    data[key] = this._valuesSchema.p((originalData as any)[key]);
                } catch (e) {
                    throw GimmeError.toFieldError(e, key);
                }
            }

            return data;
        });
    }

    maxProps(max: number) {
        return this.refine((data) => {
            if (Object.keys(data).length > max) throw new Error("Too many properties");
            return data;
        });
    }

    minProps(min: number) {
        return this.refine((data) => {
            if (Object.keys(data).length < min) throw new Error("Too less properties");
            return data;
        });
    }

    protected merge(value1: any, value2: any): any {
        const result = {} as any;
        for (const key in value1) result[key] = value1[key];
        for (const key in value2) result[key] = value2[key];
    }
}
