type FieldType =
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "null"
    | "undefined"
    | "function"
    | "symbol"
    | "bigint"
    | "any";
type FieldSchema = {
    required?: boolean;
    nullable?: boolean;
    itemType?: FieldSchema;
    type?: FieldType;
    validate?: (value: any) => boolean;
};
type Schema<T> = T extends object ? { [K in keyof T]: FieldSchema } : FieldSchema;
type InferSchemaType<T> = T extends object ? { [K in keyof T]: InferFieldType<T[K]> } : InferFieldType<T>;
type InferFieldType<T> = T extends string
    ? "string"
    : T extends number
    ? "number"
    : T extends boolean
    ? "boolean"
    : T extends any[]
    ? "array"
    : T extends object
    ? "object"
    : T extends null
    ? "null"
    : T extends undefined
    ? "undefined"
    : T extends Function
    ? "function"
    : T extends symbol
    ? "symbol"
    : T extends bigint
    ? "bigint"
    : "any";

function validateField(value: any, schema: FieldSchema): boolean {
    return false;
}

export function validate<T>(data: T, schema: Schema<T>) {
    if (!data) {
    }
}

export function createSchema<T extends object>(schema: InferSchemaType<T>): InferSchemaType<T> {
    return schema;
}
