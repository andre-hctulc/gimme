import { GimmeJSONSchema, JSONValue } from "./json-schema";
import { validate } from "json-schema";

/* 
json-schema implementation of JSON schema validation
*/

class GimmeJSONSchemaX<T extends JSONValue> extends GimmeJSONSchema<T> {
    constructor(schema: string | object) {
        super(schema, (value, schema) => {
            const valResult = validate(value as any, schema);
            return {
                errorCause: valResult.errors
                    .map((e) => e.message)
                    .filter((m) => !!m)
                    .join("\n"),
                userMessage: valResult.errors
                    .map((err) => err.message)
                    .filter((m) => !!m)
                    .join("\n"),
                error: !!valResult.errors,
            };
        });
    }
}

export function jsonSchema<T extends JSONValue>(schema: string | object) {
    return new GimmeJSONSchemaX<T>(schema);
}
