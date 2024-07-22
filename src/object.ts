import { GimmeTypeError } from "./error";
import { Gimme, InferType, Spawner } from "./gimme";

export class GimmeObject<T extends Record<string, Gimme<any>>> extends Gimme<{
    [K in keyof T]: InferType<T[K]>;
}> {
    private _propsSchema: T;

    constructor(props: T) {
        super(props);
        this._propsSchema = props;
    }

    protected spawn(
        refine: Spawner<{
            [K in keyof T]: InferType<T[K]>;
        }>
    ): void {
        refine((data, coerce) => {
            if (!data || typeof data !== "object" || Array.isArray(data))
                throw new GimmeTypeError("object", data);
            const newData = {} as any;
            // validate props
            for (const key in this._propsSchema) {
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
