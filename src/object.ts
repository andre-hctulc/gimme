import { GimmeTypeError, GimmeError } from "./error";
import { Gimme, GimmeMap, InferType, Spawner } from "./gimme";

export class GimmeObject<P extends GimmeMap> extends Gimme<InferType<P>> {
    private _propsSchema: P;

    constructor(props: P) {
        super(props);
        this._propsSchema = props;
    }

    protected spawn(refine: Spawner<InferType<P>>): void {
        refine((data, coerce) => {
            if (!data || typeof data !== "object" || Array.isArray(data))
                throw new GimmeTypeError("object", GimmeTypeError.typeof(data), {
                    userMessage: "Expected an object",
                });
            const newData = {} as any;
            // validate props
            for (const key in this._propsSchema) {
                // validate field
                try {
                    const parsedData = this._propsSchema[key].p((data as any)[key]);
                    // Only set keys if explicitly defined in data
                    if (key in data) newData[key] = parsedData;
                } catch (e) {
                    throw GimmeError.toFieldError(e, key);
                }
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

    minPropsNotUndefined(min: number) {
        return this.refine((data) => {
            const keys = Object.keys(data).filter((key) => (data as any)[key] !== undefined);
            if (keys.length < min) throw new Error("Too less properties not undefined");
            return data;
        });
    }

    maxPropsNotUndefined(max: number) {
        return this.refine((data) => {
            const keys = Object.keys(data).filter((key) => (data as any)[key] !== undefined);
            if (keys.length > max) throw new Error("Too many properties not undefined");
            return data;
        });
    }

    minPropsNotNull() {
        return this.refine((data) => {
            const keys = Object.keys(data).filter((key) => (data as any)[key] != null);
            if (keys.length < 1) throw new Error("Too less properties not null or undefined");
            return data;
        });
    }

    maxPropsNotNull() {
        return this.refine((data) => {
            const keys = Object.keys(data).filter((key) => (data as any)[key] != null);
            if (keys.length > 1) throw new Error("Too many properties not null or undefined");
            return data;
        });
    }

    minPropsNotNullOrUndefined(min: number) {
        return this.refine((data) => {
            const keys = Object.keys(data).filter((key) => (data as any)[key] != null);
            if (keys.length < min) throw new Error("Too less properties not null or undefined");
            return data;
        });
    }

    maxPropsNotNullOrUndefined(max: number) {
        return this.refine((data) => {
            const keys = Object.keys(data).filter((key) => (data as any)[key] != null);
            if (keys.length > max) throw new Error("Too many properties not null or undefined");
            return data;
        });
    }

    protected merge(value1: any, value2: any): any {
        const result = {} as any;
        for (const key in value1) result[key] = value1[key];
        for (const key in value2) result[key] = value2[key];
    }
}
