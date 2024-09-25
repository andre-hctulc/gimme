import Ajv from "ajv";
import { GimmeJSONSchema, JSONValue } from "./json-schema";

/* 
ajv implementation of JSON schema validation
*/

const ajv = new Ajv({ allErrors: true });

class GimmeJSONSchemaX<T extends JSONValue> extends GimmeJSONSchema<T> {
    constructor(schema: string | object) {
        super(schema, (value, schema) => {
            const valResult = ajv.compile(schema);
            return {
                errorCause: valResult.errors,
                error: !!valResult.errors,
                userMessage: valResult.errors
                    ?.map((e) => e.message)
                    .filter((m) => !!m)
                    .join("\n"),
            };
        });
    }
}

export function jsonSchema<T extends JSONValue>(schema: string | object) {
    return new GimmeJSONSchemaX<T>(schema);
}
