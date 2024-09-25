export interface GimmeErrorInit<C = unknown> {
    message: string;
    /**
     * User-friendly message
     *
     * Defaults to the message if not set
     */
    userMessage?: string;
    cause?: C;
    collection?: boolean;
}

export class GimmeError<C = unknown> extends Error {
    constructor(private init: GimmeErrorInit<C>) {
        super("Gimme validation error: " + init.message);
    }

    get userMessage(): string {
        return this.init.userMessage ?? this.message;
    }

    get cause(): unknown {
        return this.init.cause;
    }

    get isCollection(): boolean {
        return !!this.init.collection;
    }

    private _field: string | null = null;

    ofField(fieldName: string) {
        this._field = fieldName;
        return this;
    }

    get field() {
        return this._field;
    }

    /**
     * Sets a field of an error.
     *
     * If the error is already a GimmeError, it will only set the field if it is not already set.
     * Otherwise, it will wrap the error in a GimmeError and set the field.
     *
     * @param error The error to add the field to
     * @param fieldName The field name to set
     * @returns GimmeError
     */
    static toFieldError(error: any, fieldName: string) {
        if (error instanceof GimmeError) {
            // Only set field, if it is not already set
            if (error.field != null) return error;
            return error.ofField(fieldName);
        }

        return new GimmeError({
            message: error instanceof Error ? error.message : "Unknown error",
            userMessage: "Error parsing field " + fieldName,
            cause: error,
        }).ofField(fieldName);
    }
}

export class GimmeTypeError extends GimmeError {
    static typeof(data: any, invalidHint = false): string {
        let type: string;
        if (data === null) type = "null";
        if (Array.isArray(data)) type = "array";
        else type = typeof data;
        return invalidHint ? type + " (invalid)" : type;
    }

    constructor(readonly expected: string, readonly got: string, errorOptions?: Partial<GimmeErrorInit>) {
        super({
            message: "Invalid type: expected " + expected + ", got " + got,
            userMessage: "Invalid type: expected " + expected,
            ...errorOptions,
        });
    }
}
