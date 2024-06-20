import { GimmeError } from "./error";

export type InferGimme<T> = T extends string
    ? GimmeString
    : T extends number
    ? GimmeNumber
    : T extends boolean
    ? GimmeBool
    : T extends any[]
    ? GimmeArray<T>
    : T extends object
    ? GimmeObject<T>
    : T extends Function
    ? GimmeFunc
    : T extends symbol
    ? GimmeSymbol
    : Gimme<T>;

export type InferType<T extends Gimme<any>> = T extends Gimme<infer U> ? U : never;

/**
 * @throws GimmeError
 */
type Refine<T> = (data: T, coerce: boolean, abort: (ok: boolean) => void) => T;

function deepCopy<T>(obj: T): T {
    if (obj === null) return null as T;
    if (typeof obj !== "object") return obj as T;

    // Create an array or object to hold the values
    const copy = Array.isArray(obj) ? [] : {};

    for (var key in obj) {
        // Ensure key is not from prototype
        if (obj.hasOwnProperty(key)) {
            // Recursively copy for nested objects and arrays
            (copy as any)[key] = deepCopy(obj[key]);
        }
    }

    return copy as any;
}

abstract class Gimme<T> {
    private _refines: Refine<T>[] = [];

    refine(refiner: Refine<T>, eager = false) {
        if (eager) this._refines.unshift(refiner);
        else this._refines.push(refiner);
        return this;
    }

    validate(data: any): GimmeError[] {
        const errs: GimmeError[] = [];
        for (const refine of this._refines) {
            try {
                const result = refine(data, false, (ok) => {
                    if (!ok) throw new GimmeError(data, "Refine failed", true);
                });
            } catch (err) {
                if (err instanceof GimmeError) errs.push(err);
                else errs.push(new GimmeError(err, "Refine failed", true));
            }
        }
        return errs;
    }

    parse(data: unknown): T {
        const errors = this.validate(data);
        if (errors.length) throw new GimmeError(errors, "Parse failed", true);
        else return data as T;
    }

    coerce(data: unknown): T {
        const errors = this.validate(data);
        if (errors.length) throw new GimmeError(errors, "Coercion failed", true);
        else return this.coerceData(data);
    }

    parseSafe(data: unknown): { data: T; errors: null } | { data: undefined; errors: GimmeError[] } {
        const errors = this.validate(data);
        if (errors.length) return { data: undefined, errors };
        else return { data: this.parseData(data as T), errors: null };
    }

    ok(data: any) {
        const errs = this.validate(data);
        return !errs.length;
    }

    nullable() {
        return this.refine((data, abort) => {
            if (data === null) abort(true);
            return data;
        });
    }

    optional() {
        this._optional = true;
        return this;
    }

    default(value: T) {
        return this.refine((data) => (data === undefined ? value : data));
    }

    or(...gimmes: Gimme<any>[]) {
        this._or.push(...gimmes);
        return this;
    }

    and(...gimmes: Gimme<any>[]) {
        this._and.push(...gimmes);
        return this;
    }
}

export class GimmeString extends Gimme<string> {
    private _regex: RegExp | undefined;
    private _minLen: number | undefined;
    private _maxLen: number | undefined;
    private _values: Set<string> | undefined;
    private _forbid: string | undefined;

    constructor() {
        super();
    }

    protected validateData(data: any): boolean {
        if (typeof data !== "string") return false;
        if (this._regex && !this._regex.test(data)) return false;
        if (this._minLen && data.length < this._minLen) return false;
        if (this._maxLen && data.length > this._maxLen) return false;
        if (this._values && !this._values?.has(data)) return false;
        if (this._forbid && data.includes(this._forbid)) return false;
        return true;
    }

    regex(regex: RegExp) {
        this._regex = regex;
        return this;
    }

    maxLen(len: number) {
        this._maxLen = len;
        return this;
    }

    minLen(len: number) {
        this._minLen = len;
        return this;
    }

    values(...values: (string | string[])[]) {
        this._values = new Set(values.flat());
        return this;
    }

    forbid(substr: string) {
        this._forbid = substr;
        return this;
    }
}

export class GimmeNumber extends Gimme<number> {
    private _min: number | undefined;
    private _max: number | undefined;
    private _integer = false;

    constructor() {
        super();
    }

    protected validateData(data: any): boolean {
        if (typeof data !== "number") return false;
        if (this._min && data < this._min) return false;
        if (this._max && data > this._max) return false;
        if (this._integer && !Number.isInteger(data)) return false;
        return true;
    }

    min(min: number) {
        this._min = min;
        return this;
    }

    max(max: number) {
        this._max = max;
        return this;
    }

    integer() {
        this._integer = true;
        return this;
    }
}

export class GimmeBool extends Gimme<boolean> {
    constructor() {
        super();
    }

    protected validateData(data: any): boolean {
        return typeof data === "boolean";
    }
}

export class GimmeObject<T extends object> extends Gimme<T> {
    private _primitive = false;
    private _date = false;
    private _minDate: Date | undefined;
    private _maxDate: Date | undefined;
    private _props: { [K in keyof T]: InferGimme<T[K]> } | undefined;

    constructor(props?: { [K in keyof T]: InferGimme<T[K]> }) {
        super();
        this._props = props;
    }

    protected validateData(data: any): boolean {
        if (typeof data !== "object" || data === null) return false;
        if (this._primitive && data.constructor !== Object) return false;
        if (this._date) {
            if (!(data instanceof Date)) return false;
            if (this._minDate && data < this._minDate) return false;
            if (this._maxDate && data > this._maxDate) return false;
        }
        if (this._props) {
            for (const key in this._props) {
                if (!this._props[key].validate(data[key])) return false;
            }
        }
        return true;
    }

    primitive() {
        this._primitive = true;
        return this;
    }

    date() {
        this._date = true;
        return this;
    }

    minDate(date: Date) {
        this._minDate = date;
        return this;
    }

    maxDate(date: Date) {
        this._maxDate = date;
        return this;
    }

    props(props: { [K in keyof T]: InferGimme<T[K]> }) {
        this._props = props;
        return this;
    }
}

export class GimmeArray<T extends any[]> extends Gimme<T> {
    private _items: Gimme<T[number]> | undefined;

    constructor(items?: Gimme<T[number]>) {
        super();
        this._items = items;
    }

    protected validateData(data: any): boolean {
        if (!Array.isArray(data)) return false;
        if (this._items) {
            for (const item of data) {
                if (!this._items.validate(item)) return false;
            }
        }
        return true;
    }

    items(items: Gimme<T[number]>) {
        this._items = items;
        return this;
    }
}

export class GimmeFunc extends Gimme<Function> {
    private _primitive = false;

    constructor() {
        super();
    }

    protected validateData(data: any): boolean {
        if (typeof data !== "function") return false;
        if (this._primitive && !!data.prototype && !!data.prototype.constructor.name) return false;
        return true;
    }

    primitive() {
        this._primitive = true;
        return this;
    }
}

export class GimmeSymbol extends Gimme<symbol> {
    constructor() {
        super();
    }

    protected validateData(data: any): boolean {
        return typeof data === "symbol";
    }
}

export class GimmeAny extends Gimme<any> {
    constructor() {
        super();
    }

    protected validateData(data: any): boolean {
        return true;
    }
}
