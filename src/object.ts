import { Gimme } from "./gimme";

export class GimmeObject<T extends object> extends Gimme<T> {
    constructor(props: { [K in keyof T]: Gimme<T[K]> }) {
        super();
        this.refine((data, coerce) => {
            if (typeof data !== "object" || data === null) throw new TypeError("object");
            return data as T;
        }, true);
        this.props(props);
    }

    props(props: { [K in keyof T]: Gimme<T[K]> }) {
        return this.refine((data) => {
            for (const key in props) {
                props[key].parse((data as any)[key]);
            }
            return data as T;
        });
    }

    maxProps(max: number) {
        return this.refine((data) => {
            if (Object.keys(data as any).length > max) throw new Error("Too many properties");
            return data as T;
        });
    }

    minProps(min: number) {
        return this.refine((data) => {
            if (Object.keys(data as any).length < min) throw new Error("Too less properties");
            return data as T;
        });
    }
}
