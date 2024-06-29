export class GimmeError<C = unknown> extends Error {
    constructor(message: string, readonly cause: C | undefined = undefined, readonly collection = false) {
        super("Gimme validation error" + (message ? ": " + message : ""));
    }

    private _userMessage = "";

    get userMessage(): string {
        return this._userMessage;
    }

    setUserMessage(message: string) {
        this.message = message;
        return this;
    }
}

export class GimmeTypeError extends GimmeError {
    static typeof(data: any) {
        if (data === null) return "null";
        if (Array.isArray(data)) return "array";
        return typeof data;
    }

    constructor(expected: any, got: any, message?: string) {
        super(
            `Expected ${GimmeTypeError.typeof(expected)}, got ${GimmeTypeError.typeof(got)}${
                message ? `: ${message}` : ""
            }`
        );
    }
}
