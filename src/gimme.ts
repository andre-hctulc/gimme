import { GimmeError, GimmeTypeError } from "./error";

type ApplyNullable<T, N extends boolean> = N extends true ? T | null : T;
type ApplyOptional<T, O extends boolean> = O extends true ? T | undefined : T;

export type InferType<T extends Gimme<any>> = T extends Gimme<infer M, infer O, infer N>
    ? ApplyNullable<ApplyOptional<M, O>, N>
    : never;

/**
 * @param skip Skips following refines when called. Can be used to prevent further refines from throwing errors. You must set `RefinerOptions.canSkip` to `true` to properly use this.
 * @throws `GimmeError`
 */
export type Refiner<T> = (data: unknown, coerce: boolean, skip: () => void) => T;
type RefinerOptions = EvolveOptions & { eager?: boolean; canSkip?: boolean };

type EvolveOptions = { copy?: boolean };

export type GimmeArtefacts<T> = {
    message: string;
    refines: Refiner<T>[];
    eagerRefines: Refiner<T>[];
    canSkipRefines: Refiner<T>[];
    coerce: boolean;
};

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

const emptyArtefacts = () => {
    const empty: GimmeArtefacts<any> = {
        message: "",
        eagerRefines: [],
        refines: [],
        canSkipRefines: [],
        coerce: false,
    };
    return empty;
};

/**
 * b will overwrite a
 */
function mergeArtefacts<T>(
    a: Partial<GimmeArtefacts<T>> | null | undefined,
    b: Partial<GimmeArtefacts<T>> | null | undefined
): GimmeArtefacts<T> {
    const empty = emptyArtefacts();
    return {
        ...empty,
        ...a,
        ...b,
        refines: [...(a?.refines || []), ...(b?.refines || [])],
        eagerRefines: [...(a?.eagerRefines || []), ...(b?.eagerRefines || [])],
        canSkipRefines: [...(a?.canSkipRefines || []), ...(b?.canSkipRefines || [])],
    };
}

/**
 * @template T The type that will be parsed and validated.
 * @template O Whether the type is optional.
 * @template N Whether the type is nullable.
 * */
export abstract class Gimme<T, O extends boolean = false, N extends boolean = false> {
    static deepCopy = deepCopy;

    protected artefacts = emptyArtefacts();
    private _ctrParams: any[];

    constructor(...params: any) {
        this._ctrParams = params;
        this.spawn((refiner) => this.refine(refiner, { copy: false }));
    }

    setArtefacts(artefacts: Partial<GimmeArtefacts<T>>) {
        this.artefacts = mergeArtefacts({}, artefacts);
    }

    get isCoerce() {
        return this.artefacts.coerce;
    }

    protected abstract spawn(refine: (refiner: Refiner<T>) => void): void;

    /**
     * @param artefacts These will be merged with the current artefacts
     * @returns A copy of the current Gimme instance
     */
    evolve(artefacts: Partial<GimmeArtefacts<T>>, options: EvolveOptions = {}): typeof this {
        const newArtefacts = mergeArtefacts(this.artefacts, artefacts);
        if (options.copy === false) {
            this.artefacts = newArtefacts;
            return this;
        }
        const Ctr = this.constructor as any;
        const instance: typeof this = new Ctr(...this._ctrParams);
        instance.setArtefacts(newArtefacts);
        return instance;
    }

    refine(refiner: Refiner<T>, options: RefinerOptions = {}) {
        const newArtefacts: Partial<GimmeArtefacts<T>> = {};
        if (options.canSkip) newArtefacts.canSkipRefines = [refiner];
        if (options.eager) newArtefacts.eagerRefines = [refiner];
        else newArtefacts.refines = [refiner];
        return this.evolve(newArtefacts, options);
    }

    parseSafe(data: unknown, collectAllErrors = false): SafeParse<T> {
        const errs: GimmeError[] = [];
        const refines = [
            ...this.artefacts.canSkipRefines,
            ...this.artefacts.eagerRefines,
            ...this.artefacts.refines,
        ];
        let skipped = false;

        for (const refine of refines) {
            try {
                const refinedData = refine(data, this.artefacts.coerce, () => (skipped = true));
                if (refinedData !== undefined) data = refinedData;
                // If a refine skipped, we don't want to continue with the rest of the refines
                // for example if a nullable() receives null, we don't want/need to check further refines
                if (skipped /* && !collectAllErrors */) break;
            } catch (err) {
                if (err instanceof GimmeError) errs.push(err);
                else errs.push(new GimmeError("Unknown error", err));
                if (!collectAllErrors) break;
            }
        }

        if (!skipped && errs.length) {
            const errColl = new GimmeError<GimmeError[]>("Parse failed", errs, true);
            errColl.setUserMessage(this.artefacts.message);
            return { errors: errs, data: undefined, error: errColl };
        }

        return { errors: null, data: data as T, error: null };
    }

    getErrors(data: unknown): GimmeError[] {
        const safe = this.parseSafe(data, true);
        if (safe.errors) return safe.errors;
        else return [];
    }

    parse(data: unknown): T {
        data = deepCopy(data);
        const safe = this.parseSafe(data);
        if (safe.error) throw safe.error;
        else return safe.data;
    }

    ok(data: any): boolean {
        return !this.parseSafe(data).errors?.length;
    }

    nullable(): Gimme<T, O, true> {
        return this.refine(
            (data, c, skip) => {
                if (data === null) skip();
                return data as T;
            },
            { canSkip: true }
        );
    }

    optional(): Gimme<T, true, N> {
        return this.refine(
            (data, c, skip) => {
                if (data === undefined) skip();
                return data as T;
            },
            { canSkip: true }
        );
    }

    coerce() {
        return this.evolve({ coerce: true } as GimmeArtefacts<T>);
    }

    default(value: T): Gimme<T, O, true> {
        return this.refine((data) => (data === undefined ? value : data) as T);
    }

    or<G extends Gimme<any>[]>(...gimmes: G) {
        return this.refine(
            (data, c, skip) => {
                for (const gimme of gimmes) {
                    const { error, data: d } = gimme.parseSafe(data);
                    if (!error) skip();
                }
                return data as T;
            },
            { canSkip: true }
        );
    }

    and(...gimmes: Gimme<any>[]) {
        return this.refine((data, c, skip) => {
            for (const gimme of gimmes) {
                gimme.parse(data);
            }
            return data as T;
        });
    }

    message(message: string) {
        return this.evolve({ message } as any);
    }

    literal(value: T) {
        return this.refine((data, c, skip) => {
            if (data !== value) throw new GimmeTypeError(value, data);
            return data as T;
        });
    }

    values(values: Iterable<T>) {
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
