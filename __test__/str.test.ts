import gimme from "../src";

describe("gimme.str()", () => {
    const Schema = gimme.str();

    it("Infer type", () => {
        type ShouldBeString = gimme.Infer<typeof Schema>;
        const EnumSchema = Schema.enum(["hello", "world"] as const);
        type EnumType = gimme.Infer<typeof EnumSchema>;
        const EnumOtionalSchema = EnumSchema.optional();
        type EnumTypeOptional = gimme.Infer<typeof EnumOtionalSchema>;
    });

    it("Allow strings", () => {
        expect(Schema.parse("hello")).toBe("hello");
        expect(Schema.parse("")).toBe("");
    });

    it("Prohibit non strings", () => {
        expect(() => Schema.parse(undefined)).toThrow();
        expect(() => Schema.parse(null)).toThrow();
        expect(() => Schema.parse(33)).toThrow();
        expect(() => Schema.parse(true)).toThrow();
    });

    it("Coerce", () => {
        expect(Schema.coerce().parse("hello")).toBe("hello");
        expect(Schema.coerce().parse(0)).toBe("0");
        expect(Schema.coerce().parse(null)).toBe("");
        expect(Schema.coerce().parse(undefined)).toBe("");
    });

    it("Special refines", () => {
        expect(() => Schema.email().parse("no_email")).toThrow();
        expect(Schema.email().ok("andre.tho@gmail.com")).toBe(true);
        expect(() => Schema.url().parse("example.com")).toThrow();
        expect(Schema.url().ok("https://example.com")).toBe(true);
        expect(Schema.url().ok("http://example.com")).toBe(true);
        expect(Schema.regex(/hello/).ok("hello")).toBe(true);
        expect(Schema.regex(/hello/).ok("bye")).toBe(false);
    });
});
