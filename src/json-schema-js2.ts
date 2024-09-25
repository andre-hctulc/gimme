import { GimmeJSONSchema, JSONValue } from "./json-schema";
import { Validator } from "jsonschema";

/* 
jsonschema implementation of JSON schema validation
*/

const validator = new Validator();

class GimmeJSONSchemaX<T extends JSONValue> extends GimmeJSONSchema<T> {
    constructor(schema: string | object) {
        super(schema, (value, schema) => {
            const valResult = validator.validate(value as any, schema);
            return {
                errorCause: valResult.errors,
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
