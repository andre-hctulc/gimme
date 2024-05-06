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

abstract class Gimme<T> {
    protected _null = false;
    protected _undefined = false;
    protected _default: T | undefined;
    private _or: Gimme<any>[] = [];
    private _and: Gimme<any>[] = [];

    protected abstract val(data: any): boolean;

    nullable() {
        this._null = true;
        return this;
    }

    allowUndefined() {
        this._undefined = true;
        return this;
    }

    validate(data: any): data is T {
        let me = (this._undefined && data === undefined) || (this._null && data === null) || this.val(data);

        if (this._and.length) {
            if (!me) return false;

            for (const and of this._and) {
                if (!and.validate(data)) return false;
            }
        }

        if (!me && this._or.length) {
            console.log("Hier", this._or);
            for (const or of this._or) {
                if (or.validate(data)) {
                    me = true;
                    break;
                }
            }
        }

        return me;
    }

    default(value: T) {
        this._default = value;
        return this;
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

    constructor() {
        super();
    }

    protected val(data: any): boolean {
        if (typeof data !== "string") return false;
        if (this._regex && !this._regex.test(data)) return false;
        if (this._minLen && data.length < this._minLen) return false;
        if (this._maxLen && data.length > this._maxLen) return false;
        if (this._values && !this._values?.has(data)) return false;
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
}

export class GimmeNumber extends Gimme<number> {
    private _min: number | undefined;
    private _max: number | undefined;
    private _integer = false;

    constructor() {
        super();
    }

    protected val(data: any): boolean {
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

    protected val(data: any): boolean {
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

    protected val(data: any): boolean {
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

    protected val(data: any): boolean {
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

    protected val(data: any): boolean {
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

    protected val(data: any): boolean {
        return typeof data === "symbol";
    }
}

export class GimmeAny extends Gimme<any> {
    constructor() {
        super();
    }

    protected val(data: any): boolean {
        return true;
    }
}
