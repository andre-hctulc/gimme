import gimme from "../src";

describe("gimme.bool()", () => {
    const Schema = gimme.bool();

    it("Infers", () => {
        type ShouldBeBoolean = gimme.Infer<typeof Schema>;
    });

    it("Parses", () => {
        expect(Schema.parse(true)).toBe(true);
        expect(Schema.parse(false)).toBe(false);
    });

    it("Prohibits", () => {
        expect(Schema.ok("true")).toBe(false);
        expect(Schema.ok(1)).toBe(false);
        expect(Schema.ok({})).toBe(false);
    });

    it("Coerces", () => {
        expect(Schema.coerce().ok("hello")).toBe(true);
        expect(Schema.coerce().parse(1)).toBe(true);
        expect(Schema.coerce().parse(0)).toBe(false);
        expect(Schema.coerce().parse(null)).toBe(false);
        expect(Schema.coerce().parse(undefined)).toBe(false);
    });
});
