import { GimmeTypeError } from "./error";
import { Gimme, Spawner } from "./gimme";

export class GimmeNumber<N extends number = number> extends Gimme<N> {
    protected spawn(refine: Spawner<N>): void {
        refine((data, coerce) => {
            if (data === Infinity || data === -Infinity)
                throw new GimmeTypeError("number", "Infinity/-Infinity");

            if (coerce) {
                const coerced = Number(data);
                if (isNaN(coerced)) throw new GimmeTypeError("number", data);
                return coerced as N;
            }

            if (typeof data !== "number") throw new GimmeTypeError("number", data);
            return data as N;
        });
    }

    max(max: number) {
        return this.refine((data) => {
            if (data > max) throw new GimmeTypeError(`number <= ${max}`, data);
            return data as N;
        });
    }

    min(min: number) {
        return this.refine((data) => {
            if (data < min) throw new GimmeTypeError(`number >= ${min}`, data);
            return data as N;
        });
    }

    allowInfinity(only?: "positive" | "negative") {
        return this.refine(
            (data, coerce, skip) => {
                if (data === Infinity) {
                    if (only === "negative") throw new GimmeTypeError("-Infinity", "Infinity");
                    skip();
                    return data as N;
                }
                if (data === -Infinity) {
                    if (only === "positive") throw new GimmeTypeError("Infinity", "-Infinity");
                    skip();
                    return data as N;
                }
                return data as N;
            },
            { eager: true }
        );
    }

    enum<V extends number[]>(values: V): GimmeNumber<V[number]> {
        return this.values(values as any) as unknown as GimmeNumber<V[number]>;
    }

    int() {
        return this.refine((data) => {
            if (!Number.isInteger(data)) throw new GimmeTypeError("integer", data);
            return data as N;
        });
    }
}
