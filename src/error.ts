export interface GimmeErrorInit<C = unknown> {
    message: string;
    /**
     * User-friendly message
     *
     * Defaults to the error message.
     */
    userMessage?: string;
    cause?: C;
    collection?: boolean;
}

export class GimmeError<C = unknown> extends Error {
    constructor(private init: GimmeErrorInit<C>) {
        super(GimmeError.msg(init.message));
    }

    private static msg(message: string, field: string | null = null, user = false) {
        return `${user ? "Gimme Error" : "Error"}${field ? ` in field "${field}"` : ""}: ${message}`;
    }

    /**
     * The error message for the user. Defaults to the message.
     */
    get userMessage(): string {
        return this.init.userMessage ?? GimmeError.msg(this.init.message, this._field, true);
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
        this.message = GimmeError.msg(this.init.message, fieldName);
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
            userMessage: "Unknown error",
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
            message: "Invalid type received. Expected " + expected + ", got " + got,
            userMessage: "Invalid type. Expected " + expected,
            ...errorOptions,
        });
    }
}
