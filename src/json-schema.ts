import { GimmeError } from "./error";
import { Gimme, Spawner } from "./gimme";

export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

export type SchemaValidator = (
    value: unknown,
    schema: any
) => { errorCause?: unknown; userMessage?: string; error: boolean };

export class GimmeJSONSchema<T extends JSONValue> extends Gimme<T> {
    protected schema: object;
    /**
     * validator
     */
    private schemaValidator: SchemaValidator;

    constructor(schema: string | object, schemaValidator: SchemaValidator) {
        super();

        if (typeof schema === "string") {
            this.schema = JSON.parse(schema);
        } else {
            this.schema = schema;
        }

        this.schemaValidator = schemaValidator;
    }

    protected spawn(refine: Spawner<T>): void {
        refine((data, coerce) => {
            const { errorCause: cause, userMessage, error } = this.schemaValidator(data, this.schema);
            if (error)
                throw new GimmeError({
                    message: "Schema validation failed",
                    cause: cause,
                    userMessage,
                });
            return data as T;
        });
    }
}
