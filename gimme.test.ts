import { string, number, bool, func, array, object, any, symbol, InferType, InferGimme } from ".";

describe("gimme", () => {
    test("base (nullable, allowUndefined)", () => {
        expect(string().allowUndefined().validate(undefined)).toBe(true);
        expect(string().nullable().validate(null)).toBe(true);
        expect(string().nullable().validate(undefined)).toBe(false);
        expect(string().allowUndefined().validate(null)).toBe(false);
    });
    test("string", () => {
        expect(string().validate(44)).toBe(false);
        expect(string().validate(new String())).toBe(false);
        expect(string().validate("")).toBe(true);
        expect(string().minLen(20).validate("hello")).toBe(false);
        expect(string().maxLen(20).validate("hello")).toBe(true);
        expect(string().regex(/hello/).validate("hello")).toBe(true);
        expect(string().values("hello", "bye").validate("hello")).toBe(true);
        expect(string().minLen(1).maxLen(1).values("0").regex(/\d/).validate("0")).toBe(true);
    });

    test("number", () => {
        expect(number().validate("hello")).toBe(false);
        expect(number().validate(44)).toBe(true);
        expect(number().validate(new Number())).toBe(false);
        expect(number().min(20).validate(10)).toBe(false);
        expect(number().max(20).validate(10)).toBe(true);
        expect(number().integer().validate(10.5)).toBe(false);
    });

    test("bool", () => {
        expect(bool().validate("hello")).toBe(false);
        expect(bool().validate(true)).toBe(true);
        expect(bool().validate(false)).toBe(true);
    });

    test("func", () => {
        expect(func().validate("hello")).toBe(false);
        expect(func().validate(() => {})).toBe(true);
    });

    test("array", () => {
        expect(array().validate("hello")).toBe(false);
        expect(array().validate([])).toBe(true);
        expect(array().validate([1, 2, 3])).toBe(true);
        expect(array().validate([1, 2, "3"])).toBe(true);
        expect(array().items(number()).validate([1, 2, 3])).toBe(true);
        expect(array().items(number()).validate([1, 2, "3"])).toBe(false);
    });

    test("object", () => {
        expect(object().validate("hello")).toBe(false);
        expect(object().validate({})).toBe(true);
        expect(object().validate({ a: 1 })).toBe(true);
        expect(object({ a: number() }).validate({ a: 1 })).toBe(true);
        expect(object({ a: number() }).validate({ a: "1" })).toBe(false);
    });

    test("any", () => {
        expect(any().validate("hello")).toBe(true);
        expect(any().validate(1)).toBe(true);
        expect(any().validate(true)).toBe(true);
        expect(any().validate([])).toBe(true);
        expect(any().validate({})).toBe(true);
    });

    test("symbol", () => {
        expect(symbol().validate("hello")).toBe(false);
        expect(symbol().validate(Symbol())).toBe(true);
    });

    test("types", () => {
        const schema = object({
            name: string(),
            age: number(),
            isAlive: bool(),
            // Note, that item types or prop types can only be inferred when defined in the constructor
            // BUG array item type not auto typable
            friends: array().items(
                object({
                    name: string(),
                    age: number(),
                })
            ),
            typedFriends: array(
                object({
                    name: string(),
                    age: number(),
                })
            ),
        });

        type Interface = InferType<typeof schema>;
        type Schema = InferGimme<Interface>;

        const schema2: Schema = schema;
    });
});
