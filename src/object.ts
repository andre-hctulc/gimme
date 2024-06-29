import { Gimme, InferType, Refine } from "./gimme";

export class GimmeObject<T extends Record<string, Gimme<any>>> extends Gimme<{
    [K in keyof T]: InferType<T[K]>;
}> {
    private _propsSchema: T;

    constructor(props: T) {
        super(props);
        this._propsSchema = props;
    }

    protected spawn(refine: (refiner: Refine<{ [K in keyof T]: InferType<T[K]> }>) => void): void {
        refine((data, coerce) => {
            if (typeof data !== "object" || !data || Array.isArray(data)) throw new TypeError("object");
            for (const key in this._propsSchema) {
                this._propsSchema[key].parse((data as any)[key]);
            }
            return data as any;
        });
    }

    maxProps(max: number) {
        return this.refine((data) => {
            if (Object.keys(data as any).length > max) throw new Error("Too many properties");
            return data as any;
        });
    }

    minProps(min: number) {
        return this.refine((data) => {
            if (Object.keys(data as any).length < min) throw new Error("Too less properties");
            return data as any;
        });
    }

    len(len: number) {
        return this.refine((data) => {
            if (Object.keys(data as any).length !== len) throw new Error("Wrong number of properties");
            return data as any;
        });
    }
}
