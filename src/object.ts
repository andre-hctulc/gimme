import { Gimme, InferType } from "./gimme";

export class GimmeObject<T extends Record<string, Gimme<any>>> extends Gimme<{
    [K in keyof T]: InferType<T[K]>;
}> {
    constructor(props: T) {
        super();
        this.refine(
            (data, coerce) => {
                if (typeof data !== "object" || data === null) throw new TypeError("object");
                return data as any;
            },
            true,
            false
        );
        this.props(props, false);
    }

    props(props: Record<string, Gimme<any>>, copy = true) {
        return this.refine(
            (data) => {
                for (const key in props) {
                    props[key].parse((data as any)[key]);
                }
                return data as any;
            },
            false,
            copy
        );
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
