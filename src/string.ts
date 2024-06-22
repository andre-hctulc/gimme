import { GimmeError, GimmeTypeError } from "./error";
import { Gimme } from "./gimme";

export class GimmeString extends Gimme<string> {
    constructor() {
        super();
        this.refine((data, coerce) => {
            if (coerce) return data == null ? "" : String(data);
            if (typeof data !== "string") throw new GimmeTypeError("string", data);
            return data as string;
        }, true);
    }

    regex(regex: RegExp) {
        return this.refine((data) => {
            if (!regex.test(data as string)) throw new GimmeError("Regex not matched");
            return data as string;
        });
    }

    maxLen(len: number) {
        return this.refine((data) => {
            if ((data as string).length < len) throw new GimmeError("Too long");
            return data as string;
        });
    }

    minLen(len: number) {
        return this.refine((data) => {
            if ((data as string).length < len) throw new GimmeError("Too short");
            return data as string;
        });
    }

    len(len: number) {
        return this.refine((data) => {
            if ((data as string).length !== len) throw new GimmeError("Length mismatch");
            return data as string;
        });
    }

    email() {
        return this.regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    }

    url() {
        return this.regex(/^(http|https):\/\/[^ "]+$/);
    }

    /** prefix */
    pre(prefix: string) {
        return this.refine((data) => {
            if (!(data as string).startsWith(prefix)) throw new GimmeError("Does not start with prefix");
            return data as string;
        });
    }

    /** suffix */
    suff(suffix: string) {
        return this.refine((data) => {
            if (!(data as string).endsWith(suffix)) throw new GimmeError("Does not end with suffix");
            return data as string;
        });
    }
}
