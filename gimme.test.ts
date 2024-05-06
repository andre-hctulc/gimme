import { string, number, bool, func, array, object, any, symbol, InferType, InferGimme } from "./index.ts";

describe("Gimme", () => {
    test("allowUndefined", () => {
        expect(string().allowUndefined().validate(undefined)).toBe(true);
        expect(string().allowUndefined().validate(null)).toBe(false);
    });
    test("nullable", () => {
        expect(string().nullable().validate(null)).toBe(true);
        expect(string().nullable().validate(undefined)).toBe(false);
    });
    test("or", () => {
        expect(string().or(number()).validate(44)).toBe(true);
    });
    test("and", () => {
        expect(string().maxLen(4).and(string().minLen(1)).validate("44")).toBe(true);
        expect(string().and(number()).validate("txt")).toBe(false);
    });
});

describe("GimmeString", () => {
    test("true", () => {
        expect(string().validate("")).toBe(true);
        expect(string().validate("hello")).toBe(true);
    });
    test("false", () => {
        expect(string().validate(44)).toBe(false);
        expect(string().validate(new String())).toBe(false);
    });
    test("regex", () => {
        expect(
            string()
                .regex(/hello.*/i)
                .validate("Hello World!")
        ).toBe(true);
    });
    test("min/max length", () => {
        expect(string().minLen(1).validate("")).toBe(false);
        expect(string().maxLen(1).validate("hello")).toBe(false);
        expect(string().minLen(1).maxLen(20).validate("hello")).toBe(true);
    });
    test("complex", () => {
        expect(string().minLen(1).maxLen(1).values("0").regex(/\d/).validate("0")).toBe(true);
    });
});

describe("GimmeNumber", () => {
    test("true", () => {
        expect(number().validate(44)).toBe(true);
    });
    test("false", () => {
        expect(number().validate("hello")).toBe(false);
        expect(number().validate(new Number())).toBe(false);
    });
    test("min/max", () => {
        expect(number().min(20).validate(10)).toBe(false);
        expect(number().max(20).validate(10)).toBe(true);
    });
    test("integer", () => {
        expect(number().integer().validate(10.5)).toBe(false);
    });
});

describe("GimmeBool", () => {
    test("true", () => {
        expect(bool().validate(true)).toBe(true);
        expect(bool().validate(false)).toBe(true);
    });
    test("false", () => {
        expect(bool().validate("hello")).toBe(false);
        expect(bool().validate(new Boolean())).toBe(false);
    });
});

describe("GimmeArray", () => {
    test("true", () => {
        expect(array().validate([])).toBe(true);
        expect(array().validate([1, 2, 3])).toBe(true);
    });
    test("false", () => {
        expect(array().validate("hello")).toBe(false);
        expect(array().validate({})).toBe(false);
    });
});

describe("GimmeFunc", () => {
    // TODO primitive
    test("true", () => {
        expect(func().validate(() => {})).toBe(true);
    });
    test("false", () => {
        expect(func().validate("hello")).toBe(false);
        expect(func().validate(48)).toBe(false);
    });
    test("primitive", () => {
        expect(
            func()
                .primitive()
                .validate(() => {})
        ).toBe(true);
        expect(func().primitive().validate(Function)).toBe(false);
    });
});

describe("GimmeObject", () => {
    test("true", () => {
        expect(object().validate({})).toBe(true);
        expect(object({ a: string() }).validate({ a: "hello" })).toBe(true);
    });
    test("false", () => {
        expect(object().validate("hello")).toBe(false);
        expect(object({ a: string() }).validate({ a: 1 })).toBe(false);
    });
    test("primitive", () => {
        expect(object().primitive().validate({})).toBe(true);
        expect(
            object()
                .primitive()
                .validate(new (class {})())
        ).toBe(false);
    });
});

describe("GimmeSymbol", () => {
    test("true", () => {
        expect(symbol().validate(Symbol())).toBe(true);
    });
    test("false", () => {
        expect(symbol().validate("hello")).toBe(false);
    });
});

describe("GimmeAny", () => {
    test("true", () => {
        expect(any().validate("hello")).toBe(true);
        expect(any().validate(1)).toBe(true);
        expect(any().validate(true)).toBe(true);
        expect(any().validate([])).toBe(true);
        expect(any().validate({})).toBe(true);
    });
});

describe("Utility", () => {
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
