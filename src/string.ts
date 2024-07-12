import { GimmeError, GimmeTypeError } from "./error";
import { Gimme, Refiner } from "./gimme";

export class GimmeString<S extends string = string> extends Gimme<S> {
    protected spawn(refine: (refiner: Refiner<S>) => void): void {
        refine((data, coerce) => {
            if (coerce) return data == null ? ("" as S) : (String(data) as S);
            if (typeof data !== "string") throw new GimmeTypeError("string", data);
            return data as S;
        });
    }

    regex(regex: RegExp) {
        return this.refine((data) => {
            if (!regex.test(data as string)) throw new GimmeError("Regex not matched");
            return data as S;
        });
    }

    maxLen(len: number) {
        return this.refine((data) => {
            if ((data as string).length > len) throw new GimmeError("Too long");
            return data as S;
        });
    }

    minLen(len: number) {
        return this.refine((data) => {
            if ((data as string).length < len) throw new GimmeError("Too short");
            return data as S;
        });
    }

    len(len: number) {
        return this.refine((data) => {
            if ((data as string).length !== len) throw new GimmeError("Length mismatch");
            return data as S;
        });
    }

    email() {
        return this.refine((data) => {
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data as string))
                throw new GimmeError("Not an email");
            return data as S;
        });
    }

    url() {
        return this.refine((data) => {
            if (!/^(http|https):\/\/[^ "]+$/.test(data as string)) throw new GimmeError("Not an URL");
            return data as S;
        });
    }

    /** prefix */
    pre(prefix: string) {
        return this.refine((data) => {
            if (!(data as string).startsWith(prefix)) throw new GimmeError("Does not start with prefix");
            return data as S;
        });
    }

    /** suffix */
    suff(suffix: string) {
        return this.refine((data) => {
            if (!(data as string).endsWith(suffix)) throw new GimmeError("Does not end with suffix");
            return data as S;
        });
    }

    enum<V extends string[]>(values: V): GimmeString<V[number]> {
        return this.values(values as any) as unknown as GimmeString<V[number]>;
    }
}
