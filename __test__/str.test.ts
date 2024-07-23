import g, { Gimme } from "../src";

describe("gimme.str()", () => {
    const Schema = g.str();

    it("Infers", () => {
        type ShouldBeString = g.Infer<typeof Schema>;
        const EnumSchema = Schema.enum(["hello", "world"] as const);
        type EnumType = g.Infer<typeof EnumSchema>;
        const EnumOtionalSchema = EnumSchema.optional();
        type EnumTypeOptional = g.Infer<typeof EnumOtionalSchema>;
    });

    it("Parses", () => {
        expect(Schema.parse("hello")).toBe("hello");
        expect(Schema.parse("")).toBe("");
    });

    it("Prohibits", () => {
        expect(() => Schema.parse(undefined)).toThrow();
        expect(() => Schema.parse(null)).toThrow();
        expect(() => Schema.parse(33)).toThrow();
        expect(() => Schema.parse(true)).toThrow();
    });

    it("Coerces", () => {
        expect(Schema.coerce().parse("hello")).toBe("hello");
        expect(Schema.coerce().parse(0)).toBe("0");
        expect(Schema.coerce().parse(null)).toBe("");
        expect(Schema.coerce().parse(undefined)).toBe("");
    });

    it("Refines", () => {
        expect(() => Schema.email().parse("no_email")).toThrow();
        expect(Schema.email().ok("andre.tho@gmail.com")).toBe(true);
        expect(() => Schema.url().parse("example.com")).toThrow();
        expect(Schema.url().ok("https://example.com")).toBe(true);
        expect(Schema.url().ok("http://example.com")).toBe(true);
        expect(Schema.regex(/hello/).ok("hello")).toBe(true);
        expect(Schema.regex(/hello/).ok("bye")).toBe(false);
    });
});
