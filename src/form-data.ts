import { GimmeTypeError } from "./error";
import { Gimme, InferType, Refiner } from "./gimme";

export class GimmeFormData<T extends Record<string, Gimme<any>>> extends Gimme<{
    [K in keyof T]: InferType<T[K]>;
}> {
    private _propsSchema: T;

    constructor(props: T) {
        super(props);
        this._propsSchema = props;
    }

    protected spawn(refine: (refiner: Refiner<{ [K in keyof T]: InferType<T[K]> }>) => void): void {
        refine((data, coerce) => {
            if (!(data instanceof FormData)) throw new GimmeTypeError("FormData", data);
            // We transform the FormData into a plain object
            const newData = {} as any;
            // validate props
            for (const [key, value] of data.entries()) {
                // validate field
                const parsedData = this._propsSchema[key].parse((data as any)[key]);
                // Only set keys if explicitly defined in data
                if (key in data) newData[key] = parsedData;
            }
            return newData as any;
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
}
