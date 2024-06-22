import { GimmeError, GimmeTypeError } from "./error";

export type InferType<T extends Gimme<any>> = T extends Gimme<infer U> ? U : never;

/**
 * @param skip Skips following refines when called. Can be used to prevent further refines from throwing errors.
 * @throws `GimmeError`
 */
type Refine<T> = (data: unknown, coerce: boolean, skip: () => void) => T;

type GimmeArtefacts<T, A extends object = {}> = {
    message: string;
    refines: Refine<T>[];
    eagerRefines: Refine<T>[];
} & Partial<A>;

export type SafeParse<T> =
    | { data: T; errors: null; error: null }
    | { data: undefined; errors: GimmeError[]; error: GimmeError<GimmeError[]> };

function deepCopy<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    const copy = {};
    // Works for arrays too!
    for (const key in obj) {
        (copy as any)[key] = deepCopy(obj[key]);
    }
    return copy as T;
}

export abstract class Gimme<T, A extends object = {}> {
    static deepCopy = deepCopy;

    protected artefacts: GimmeArtefacts<T, A> = { message: "", eagerRefines: [], refines: [] } as any;

    constructor(artefacts?: Partial<GimmeArtefacts<T, A>>) {
        if (artefacts) this.artefacts = { ...this.artefacts, artefacts };
    }

    /**
     * @param artefacts These will be merged with the current artefacts
     * @returns A copy of the current Gimme instance
     */
    copy(artefacts?: Partial<GimmeArtefacts<T, A>>): Gimme<T> {
        const Ctr = this.constructor as any;
        return new Ctr({ ...this.artefacts, ...artefacts });
    }

    refine(refiner: Refine<T>, eager = false, copy = true) {
        return this.copy({
            refines: copy ? [...this.artefacts.refines, refiner] : this.artefacts.refines,
            eagerRefines: eager ? [...this.artefacts.eagerRefines, refiner] : this.artefacts.eagerRefines,
        } as GimmeArtefacts<T, A>);
    }

    parseSafe(data: unknown, coerce = false): SafeParse<T> {
        const errs: GimmeError[] = [];
        const refines = [...this.artefacts.eagerRefines, ...this.artefacts.refines];

        for (const refine of refines) {
            try {
                let skip = false;
                const refinedData = refine(data, coerce, () => (skip = true));
                if (refinedData !== undefined) data = refinedData;
                if (skip) break;
            } catch (err) {
                if (err instanceof GimmeError) errs.push(err);
            }
        }
        if (errs.length) {
            const errColl = new GimmeError<GimmeError[]>("Parse failed", errs, true);
            errColl.setUserMessage(this.artefacts.message);
            return { errors: errs, data: undefined, error: errColl };
        }

        return { errors: null, data: data as T, error: null };
    }

    validate(data: unknown): GimmeError[] {
        const safe = this.parseSafe(data);
        if (safe.errors) return safe.errors;
        else return [];
    }

    parse(data: unknown): T {
        data = deepCopy(data);
        const safe = this.parseSafe(data);
        if (safe.error) throw safe.error;
        else return safe.data;
    }

    coerce(data: unknown): T {
        const safe = this.parseSafe(data, true);
        if (safe.errors) {
            throw new GimmeError("Parse failed", safe.errors, true);
        } else return safe.data;
    }

    ok(data: any): boolean {
        return !this.parseSafe(data).data;
    }

    nullable() {
        return this.refine((data, c, skip) => {
            if (data === null) skip();
            return data as T;
        }, true);
    }

    optional() {
        return this.refine((data, c, skip) => {
            if (data === undefined) skip();
            return data as T;
        }, true);
    }

    default(value: T) {
        return this.refine((data) => (data === undefined ? value : data) as T);
    }

    or(...gimmes: Gimme<any>[]) {
        return this.refine((data, c, skip) => {
            for (const gimme of gimmes) {
                const { error, data: d } = gimme.parseSafe(data);
                if (!error) skip();
            }
            return data as T;
        });
    }

    and(...gimmes: Gimme<any>[]) {
        return this.refine((data, c, skip) => {
            for (const gimme of gimmes) {
                const { error, data: d } = gimme.parseSafe(data);
                if (error) throw error;
            }
            return data as T;
        });
    }

    message(message: string) {
        return this.copy({ message } as GimmeArtefacts<T, A>);
    }

    literal(value: T) {
        return this.refine((data, c, skip) => {
            if (data !== value) throw new GimmeTypeError(value, data);
            return data as T;
        });
    }

    values(values: T[]) {
        const set = new Set(values);
        return this.refine((data, c, skip) => {
            if (!set.has(data as T)) throw new GimmeError("Value not in list");
            return data as T;
        });
    }

    forbidden(values: T[]) {
        const set = new Set(values);
        return this.refine((data, c, skip) => {
            if (set.has(data as T)) throw new GimmeError("Got forbidden value");
            return data as T;
        });
    }
}
