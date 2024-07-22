import { GimmeError, GimmeTypeError } from "./error";
import { Gimme, Spawner } from "./gimme";

export class GimmeString<S extends string = string> extends Gimme<S> {
    protected spawn(refine: Spawner<S>): void {
        refine((data, coerce) => {
            if (coerce) return data == null ? ("" as S) : (String(data) as S);
            if (typeof data !== "string") throw new GimmeTypeError("string", data);
            return data as S;
        });
    }

    regex(regex: RegExp) {
        return this.refine((data) => {
            if (!regex.test(data)) throw new GimmeError("Regex not matched");
            return data as S;
        });
    }

    maxLen(len: number) {
        return this.refine((data) => {
            if (data.length > len) throw new GimmeError("Too long");
            return data as S;
        });
    }

    minLen(len: number) {
        return this.refine((data) => {
            if (data.length < len) throw new GimmeError("Too short");
            return data as S;
        });
    }

    len(len: number) {
        return this.refine((data) => {
            if (data.length !== len) throw new GimmeError("Length mismatch");
            return data;
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
            return data;
        });
    }

    /** prefix */
    pre(prefix: string) {
        return this.refine((data) => {
            if (!data.startsWith(prefix)) throw new GimmeError("Does not start with prefix");
            return data;
        });
    }

    /** suffix */
    suff(suffix: string) {
        return this.refine((data) => {
            if (!data.endsWith(suffix)) throw new GimmeError("Does not end with suffix");
            return data;
        });
    }

    enum<V extends string[]>(values: V): GimmeString<V[number]> {
        return this.values(values as any) as unknown as GimmeString<V[number]>;
    }
}
