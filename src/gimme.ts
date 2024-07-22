import { GimmeError, GimmeTypeError } from "./error";

type ApplyNullable<T, N extends boolean> = N extends true ? T | null : T;
type ApplyOptional<T, O extends boolean> = O extends true ? T | undefined : T;

export type InferType<T extends Gimme> = T extends Gimme<infer M, infer O, infer N>
    ? ApplyNullable<ApplyOptional<M, O>, N>
    : never;

type RefinerOptions = EvolveOptions & { eager?: boolean };
/**
 * @param skip Skips following refines when called. Can be used to prevent further refines from throwing errors. You must set `RefinerOptions.canSkip` to `true` to properly use this.
 * @throws `GimmeError`
 */
export type Refiner<T> = (data: T, coerce: boolean, skip: () => void, originalData: unknown) => T;
export type Spawner<T> = (refiner: (originalData: unknown, coerce: boolean) => T) => void;

type EvolveOptions = { copy?: boolean };

export type GimmeArtefacts<T> = {
    message: string;
    refines: Refiner<T>[];
    eagerRefines: Refiner<T>[];
    coerce: boolean;
};

export type SafeParse<T> =
    | { data: T; errors: null; error: null }
    | { data: undefined; errors: GimmeError[]; error: GimmeError<GimmeError[]> };

const emptyArtefacts = () => {
    const empty: GimmeArtefacts<any> = {
        message: "",
        refines: [],
        eagerRefines: [],
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
    };
}

/**
 * @template T The type that will be parsed and validated.
 * @template O Whether the type is optional.
 * @template N Whether the type is nullable.
 * */
export abstract class Gimme<T = any, O extends boolean = false, N extends boolean = false> {
    protected artefacts = emptyArtefacts();
    private _ctrParams: any[];

    constructor(...params: any) {
        this._ctrParams = params;
        this.spawn((refiner) =>
            this.refine((d, coerce, skip, originalData) => refiner(originalData, coerce), { copy: false })
        );
    }

    setArtefacts(artefacts: Partial<GimmeArtefacts<T>>) {
        this.artefacts = mergeArtefacts({}, artefacts);
    }

    get isCoerce() {
        return this.artefacts.coerce;
    }

    protected abstract spawn(refine: Spawner<T>): void;
    protected merge?(value1: any, value2: any): any;

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
        if (options.eager) newArtefacts.eagerRefines = [refiner];
        else newArtefacts.refines = [refiner];
        return this.evolve(newArtefacts, options);
    }

    parseSafe(data: unknown, collectAllErrors = false): SafeParse<T> {
        const errs: GimmeError[] = [];
        const refines = [...this.artefacts.eagerRefines, ...this.artefacts.refines];
        let skipped = false;
        let refinedData = data;

        for (const refine of refines) {
            try {
                refinedData = refine(refinedData, this.artefacts.coerce, () => (skipped = true), data);
                // If a refine skipped, we don't want to continue with the rest of the refines
                // for example if a nullable() receives null, we don't want/need to check further refines
                if (skipped) break;
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

        return { errors: null, data: refinedData as T, error: null };
    }

    getErrors(data: unknown): GimmeError[] {
        const safe = this.parseSafe(data, true);
        if (safe.errors) return safe.errors;
        else return [];
    }

    parse(data: unknown): T {
        const safe = this.parseSafe(data);
        if (safe.error) throw safe.error;
        else return safe.data;
    }

    ok(data: any): boolean {
        return !this.parseSafe(data).errors?.length;
    }

    /** Preserves the _this_ context, other than `parse`. You can pass `Gimme.v` as independent function. */
    v = (data: unknown) => {
        return this.parse(data);
    };

    nullable(): Gimme<T, O, true> {
        return this.refine(
            (d, c, skip, od) => {
                if (od === null) skip();
                return od as T;
            },
            { eager: true }
        );
    }

    optional(): Gimme<T, true, N> {
        return this.refine(
            (d, c, skip, od) => {
                if (od === undefined) skip();
                return od as any;
            },
            { eager: true }
        );
    }

    coerce() {
        return this.evolve({ coerce: true } as GimmeArtefacts<T>);
    }

    default(value: T): Gimme<T, O, true> {
        return this.refine((data) => (data === undefined ? value : data) as T);
    }

    or<S>(schema: Gimme<S>): Gimme<T | S, O, N> {
        return this.refine(
            (data, c, skip, originalData) => {
                const { error, data: d } = schema.parseSafe(originalData);
                if (!error) skip();
                return data as T;
            },
            { eager: true }
        ) as Gimme<any, boolean, boolean>;
    }

    and<S>(schema: Gimme<S>): Gimme<T & S, O, N> {
        if (!this.merge) throw new Error("Cannot use 'and' with this type");

        return this.refine((data, c, skip, originalData) => {
            const newValue = schema.parse(originalData);
            return this.merge!(data, newValue);
        }) as Gimme<any, boolean, boolean>;
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
