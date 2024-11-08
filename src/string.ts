import { GimmeArray } from "./array";
import { GimmeError, GimmeTypeError } from "./error";
import { Gimme, Spawner } from "./gimme";

export class GimmeString<T extends string = string> extends Gimme<T> {
    protected spawn(refine: Spawner<T>): void {
        refine((data, coerce) => {
            if (coerce) return data == null ? ("" as T) : (String(data) as T);
            if (typeof data !== "string")
                throw new GimmeTypeError("string", GimmeTypeError.typeof(data), {
                    userMessage: "Expected text",
                });
            return data as T;
        });
    }

    regex(regex: RegExp) {
        return this.refine((data) => {
            if (!regex.test(data)) throw new GimmeError({ message: "Pattern not matched" });
            return data as T;
        });
    }

    maxLen(len: number) {
        return this.refine((data) => {
            if (data.length > len) throw new GimmeError({ message: "The value is too long. Max: " + len });
            return data as T;
        });
    }

    minLen(len: number) {
        return this.refine((data) => {
            if (data.length < len) throw new GimmeError({ message: "The value is too short. Min: " + len });
            return data as T;
        });
    }

    len(len: number) {
        return this.refine((data) => {
            if (data.length !== len) throw new GimmeError({ message: "Expected length " + len });
            return data;
        });
    }

    email() {
        return this.refine((data) => {
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data as string))
                throw new GimmeError({ message: "Not an email" });
            return data as T;
        });
    }

    url() {
        return this.refine((data) => {
            if (!/^(http|https):\/\/[^ "]+$/.test(data as string))
                throw new GimmeError({ message: "Not an URL" });
            return data;
        });
    }

    /** prefix */
    pre(prefix: string) {
        return this.refine((data) => {
            if (!data.startsWith(prefix)) throw new GimmeError({ message: "Expected prefix " + prefix });
            return data;
        });
    }

    /** suffix */
    suff(suffix: string) {
        return this.refine((data) => {
            if (!data.endsWith(suffix)) throw new GimmeError({ message: "Expected suffix " + suffix });
            return data;
        });
    }

    enum<V extends string[]>(values: V): GimmeString<V[number]> {
        return this.values(values as any) as unknown as GimmeString<V[number]>;
    }

    /** Causes extra parsing */
    json(schema?: Gimme) {
        return this.refine((data) => {
            try {
                const parsed = JSON.parse(data as string);
                if (schema) schema.p(parsed);
                return data;
            } catch (e) {
                throw new GimmeTypeError("JSON", data);
            }
        });
    }

    uuid() {
        return this.refine((data) => {
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(data as string))
                throw new GimmeTypeError("UUID", data);
            return data;
        });
    }

    split(separator: string, itemSchema?: Gimme<string>) {
        return this.transform<string[]>(
            (data) => {
                return (data as string).split(separator);
            },
            class extends GimmeArray<GimmeString> {
                constructor() {
                    super(itemSchema || new GimmeString());
                }
            }
        );
    }
}
