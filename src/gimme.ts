import { GimmeError } from "./error";

type ApplyNullable<T, N extends boolean> = N extends true ? T | null : T;
type ApplyOptional<T, O extends boolean> = O extends true ? T | undefined : T;

export type InferType<T extends Gimme | GimmeMap> = T extends Gimme<infer M, infer O, infer N>
    ? ApplyNullable<ApplyOptional<M, O>, N>
    : // resolve map
    T extends GimmeMap
    ? {
          [K in OptionalsMap<T>]?: InferType<T[K]>;
      } & {
          [K in Exclude<keyof T, OptionalsMap<T>>]: InferType<T[K]>;
      }
    : never;

export type GimmeMap = Record<string, Gimme>;

type OptionalsMap<T extends GimmeMap> = {
    [K in keyof T]: T[K] extends Gimme<any, infer O, any> ? (O extends true ? K : never) : never;
}[keyof T];

type EvolveOptions = { copy?: boolean };
type RefinerOptions = EvolveOptions & { eager?: boolean };

/**
 * @param skip Skips following refines when called. Can be used to prevent further refines from throwing errors. You must set `RefinerOptions.canSkip` to `true` to properly use this.
 * @throws `GimmeError`
 */
export type Refiner<T> = (data: T, coerce: boolean, skip: () => void, originalData: unknown) => T;
export type Spawner<T> = (refiner: (originalData: unknown, coerce: boolean) => T) => void;

export type GimmeArtifacts<T> = {
    refines: Refiner<T>[];
    eagerRefines: Refiner<T>[];
    coerce: boolean;
};

export type SafeParse<T> =
    | { data: T; errors: null; error: null }
    | { data: undefined; errors: GimmeError[]; error: GimmeError<GimmeError[]> };

const emptyArtifacts = () => {
    const empty: GimmeArtifacts<any> = {
        refines: [],
        eagerRefines: [],
        coerce: false,
    };
    return empty;
};

/**
 * b will overwrite a
 */
function mergeArtifacts<T>(
    a: Partial<GimmeArtifacts<T>> | null | undefined,
    b: Partial<GimmeArtifacts<T>> | null | undefined
): GimmeArtifacts<T> {
    const empty = emptyArtifacts();
    return {
        ...empty,
        ...a,
        ...b,
        refines: [...(a?.refines || []), ...(b?.refines || [])],
        eagerRefines: [...(a?.eagerRefines || []), ...(b?.eagerRefines || [])],
    };
}

/**
 * @template T The type that will be parsed and validated
 * @template O Whether the type is optional
 * @template N Whether the type is nullable
 * */
export abstract class Gimme<T = any, O extends boolean = false, N extends boolean = false> {
    protected artifacts = emptyArtifacts();
    private _ctrParams: any[];

    constructor(...params: any) {
        this._ctrParams = params;
        this.spawn((refiner) =>
            this.refine((d, coerce, skip, originalData) => refiner(originalData, coerce), { copy: false })
        );
    }

    setArtifacts(artifacts: Partial<GimmeArtifacts<T>>) {
        this.artifacts = mergeArtifacts({}, artifacts);
    }

    get isCoerce() {
        return this.artifacts.coerce;
    }

    protected abstract spawn(refine: Spawner<T>): void;
    protected merge?(value1: any, value2: any): any;

    /**
     * @param artifacts These will be merged with the current artifacts
     * @returns A copy of the current Gimme instance
     */
    private evolve(artifacts: Partial<GimmeArtifacts<T>>, options: EvolveOptions = {}): typeof this {
        const newArtifacts = mergeArtifacts(this.artifacts, artifacts);
        if (options.copy === false) {
            this.artifacts = newArtifacts;
            return this;
        }
        const Ctr = this.constructor as any;
        const instance: typeof this = new Ctr(...this._ctrParams);
        instance.setArtifacts(newArtifacts);
        return instance;
    }

    refine(refiner: Refiner<T>, options: RefinerOptions = {}): typeof this {
        const newArtifacts: Partial<GimmeArtifacts<T>> = {};
        if (options.eager) newArtifacts.eagerRefines = [refiner];
        else newArtifacts.refines = [refiner];
        return this.evolve(newArtifacts, options);
    }

    coerce() {
        return this.evolve({ coerce: true } as GimmeArtifacts<T>);
    }

    parseSafe(data: unknown, collectAllErrors = false): SafeParse<T> {
        const errs: GimmeError[] = [];
        const refines = [...this.artifacts.eagerRefines, ...this.artifacts.refines];
        let skipped = false;
        let refinedData = data;

        for (const refine of refines) {
            try {
                refinedData = refine(refinedData, this.artifacts.coerce, () => (skipped = true), data);
                // If a refine skipped, we don't want to continue with the rest of the refines
                // for example if a nullable() receives null, we don't want/need to check further refines
                if (skipped) break;
            } catch (err) {
                if (err instanceof GimmeError) errs.push(err);
                else errs.push(new GimmeError({ message: "Unknown error", cause: err }));
                if (!collectAllErrors) break;
            }
        }

        if (!skipped && errs.length) {
            const errCollection = new GimmeError<GimmeError[]>({
                message: "Parse failed",
                collection: true,
                cause: errs,
            });
            return { errors: errs, data: undefined, error: errCollection };
        }

        return { errors: null, data: refinedData as T, error: null };
    }

    getErrors(data: unknown): GimmeError[] {
        const safe = this.parseSafe(data, true);
        if (safe.errors) return safe.errors;
        else return [];
    }

    /** Shortcut for `parse` */
    p = (data: unknown) => {
        const safe = this.parseSafe(data);
        if (safe.error) throw safe.error;
        else return safe.data as T;
    };

    parse = (data: unknown) => {
        const safe = this.parseSafe(data);
        if (safe.error) throw safe.error;
        else return safe.data as T;
    };

    ok(data: any): boolean {
        return !this.parseSafe(data).errors?.length;
    }

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
                if (od === undefined) {
                    skip();
                    return od;
                }
                return od as any;
            },
            { eager: true }
        );
    }

    default(value: T): Gimme<T, O, true> {
        return this.refine((data, c, skip) => {
            if (data === undefined) {
                skip();
                return value;
            }
            return data;
        });
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
            const newValue = schema.p(originalData);
            return this.merge!(data, newValue);
        }) as Gimme<any, boolean, boolean>;
    }

    message(message: string) {
        return this.evolve({ message } as any);
    }

    literal(value: T) {
        return this.refine((data, c, skip) => {
            if (data !== value) throw new GimmeError({ message: "Value not allowed" });
            return data as T;
        });
    }

    values(values: Iterable<T>) {
        const set = new Set(values);
        return this.refine((data, c, skip) => {
            if (!set.has(data as T)) throw new GimmeError({ message: "Value not allowed" });
            return data as T;
        });
    }

    forbid(values: T[]) {
        const set = new Set(values);
        return this.refine((data, c, skip) => {
            if (set.has(data as T)) throw new GimmeError({ message: "Value forbidden" });
            return data as T;
        });
    }
}
