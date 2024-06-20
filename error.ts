export class GimmeError extends TypeError {
    constructor(readonly cause: unknown, message: string, readonly collection = false) {
        super("Gimme validation error" + (message ? ": " + message : ""));
    }
}

export class GimmeExpectError extends TypeError {
    constructor(expected: string, got: string) {
        super(`Expected "${expected}", got "${got}"`);
    }
}
