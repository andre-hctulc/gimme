import { GimmeError } from "./error";

export type InferType<T extends Gimme | GimmeMap> = T extends Gimme<infer M>
    ? M
    : // resolve map
    T extends GimmeMap
    ? {
          [K in OptionalsMap<T>]?: InferType<T[K]>;
      } & {
          [K in Exclude<keyof T, OptionalsMap<T>>]: InferType<T[K]>;
      }
    : never;

export type GimmeMap = Record<string, Gimme>;

type GimmeCtr<T = any> = T extends Gimme ? new (...params: any) => T : new (...params: any) => Gimme<T>;

export type GimmeClassSpec<T extends Gimme> = Omit<T, "parse" | "p" | "parseSafe">;
export type GimmeClassBody<T extends Gimme> = Pick<T, "parse" | "p" | "parseSafe">;
export type GimmeMerge<S, G extends Gimme> = Pick<Gimme<S>, keyof Gimme> & Omit<G, keyof Gimme>;

type OptionalsMap<T extends GimmeMap> = {
    [K in keyof T]: T[K] extends Gimme<infer T> ? (undefined extends T ? K : never) : never;
}[keyof T];

type EvolveOptions = {
    /**
     * @default true
     */
    copy?: boolean;
};

type RefinerOptions = EvolveOptions & { eager?: boolean };

/**
 * @param skip Skips following refines when called. Can be used to prevent further refines from throwing errors. You must set `RefinerOptions.canSkip` to `true` to properly use this.
 * @throws `GimmeError`
 */
export type Refiner<T> = (data: T, coerce: boolean, skip: () => void, originalData: unknown) => T;
export type Transformer<I, O> = (data: I, coerce: boolean) => O;
export type Spawner<T> = (refiner: (originalData: unknown, coerce: boolean) => T) => void;

export type GimmeArtifacts<T> = {
    evolutions: (Refiner<T> | Transformer<T, any>)[];
    eagerRefines: Refiner<T>[];
    coerce: boolean;
};

export type SafeParse<T> =
    | { data: T; errors: null; error: null }
    | {
          data: undefined;
          errors: GimmeError[];
          /**
           * When `collectAllErrors` is `true`, this will be a `GimmeError` with all errors as cause,
           * otherwise, it will be the first error.
           * */
          error: GimmeError;
      };

/**
 * @template S The source type
 * @template S The target type
 */
type ApplyNullable<S, T> = null extends S ? T | null : T;

/**
 * @template S The source type
 * @template T The target type
 */
type ApplyOptional<S, T> = undefined extends S ? T | undefined : T;

const emptyArtifacts = () => {
    const empty: GimmeArtifacts<any> = {
        evolutions: [],
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
        evolutions: [...(a?.evolutions || []), ...(b?.evolutions || [])],
        eagerRefines: [...(a?.eagerRefines || []), ...(b?.eagerRefines || [])],
    };
}

/**
 * @template T The type that will be parsed and validated
 * @template O Whether the type is optional
 * @template N Whether the type is nullable
 * */
export abstract class Gimme<T = any /* , O extends boolean = false, N extends boolean = false */> {
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
    private evolve(
        artifacts: Partial<GimmeArtifacts<T>>,
        options: EvolveOptions = {},
        GimmeCtr?: GimmeCtr
    ): Gimme {
        if (!GimmeCtr) GimmeCtr = this.constructor as any;

        // Merge the artifacts
        const newArtifacts = mergeArtifacts(this.artifacts, artifacts);

        // return this if copy is false
        if (options.copy === false) {
            this.artifacts = newArtifacts;
            return this;
        }

        // Copy the instance and set the new artifacts
        // Only pass ctr params if the GimmeCtr is the current instance
        const instance: Gimme = new GimmeCtr!(...(GimmeCtr === this.constructor ? this._ctrParams : []));
        instance.setArtifacts(newArtifacts);

        return instance;
    }

    refine(refiner: Refiner<T>, options: RefinerOptions = {}): typeof this {
        const newArtifacts: Partial<GimmeArtifacts<T>> = {};
        if (options.eager) newArtifacts.eagerRefines = [refiner];
        else newArtifacts.evolutions = [refiner];
        return this.evolve(newArtifacts, options) as typeof this;
    }

    coerce() {
        return this.evolve({ coerce: true });
    }

    /**
     * @param transformer The function that will transform the data
     * @param GimmeCtr The schema class for the transformed data
     */
    transform<O>(transformer: Transformer<T, O>, GimmeCtr: GimmeCtr<O>): Gimme<O> {
        const newArtifacts: Partial<GimmeArtifacts<T>> = {};
        newArtifacts.evolutions = [transformer];
        return this.evolve(newArtifacts, {}, GimmeCtr) as any;
    }

    parseSafe(data: unknown, collectAllErrors = false): SafeParse<T> {
        const errs: GimmeError[] = [];
        const evolutions = [...this.artifacts.eagerRefines, ...this.artifacts.evolutions];
        let skipped = false;
        let refinedData = data;

        for (const evolution of evolutions) {
            try {
                refinedData = evolution(refinedData, this.artifacts.coerce, () => (skipped = true), data);
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
            const masterError = collectAllErrors
                ? new GimmeError({ message: "Parse failed", cause: errs })
                : errs[0];
            return { errors: errs, data: undefined, error: masterError };
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

    nullable(): Gimme<T | null> {
        return this.refine(
            (d, c, skip, od) => {
                if (od === null) skip();
                return od as T;
            },
            { eager: true }
        ) as any;
    }

    optional(): Gimme<T | undefined> {
        return this.refine(
            (d, c, skip, od) => {
                if (od === undefined) {
                    skip();
                    return od;
                }
                return od as any;
            },
            { eager: true }
        ) as any;
    }

    default(value: T, mapNull = false) {
        return this.refine((data, c, skip) => {
            if (data === undefined || (mapNull && data === null)) {
                skip();
                return value;
            }
            return data;
        });
    }

    or<S>(schema: Gimme<S>): Gimme<T | S> {
        return this.refine(
            (data, c, skip, originalData) => {
                const { error, data: d } = schema.parseSafe(originalData);
                if (!error) skip();
                return data as T;
            },
            { eager: true }
        ) as Gimme<any>;
    }

    and<S>(schema: Gimme<S>): Gimme<T & S> {
        if (!this.merge) throw new Error("Cannot use 'and' with this type");

        return this.refine((data, c, skip, originalData) => {
            const newValue = schema.p(originalData);
            return this.merge!(data, newValue);
        }) as Gimme<any>;
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

    /**
     * Use this to specify the
     * @param copy Whether to create a new instance or mutate the current one
     */
    as<G extends Gimme<T | Exclude<T, undefined | null>>>(copy = false): GimmeMerge<T, G> {
        if (copy) return this.copy() as any;
        return this as any;
    }

    copy() {
        return this.evolve({});
    }
}
