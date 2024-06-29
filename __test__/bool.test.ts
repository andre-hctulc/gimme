import gimme from "../src";

describe("gimme.bool()", () => {
    const Schema = gimme.bool();

    it("Infer type", () => {
        type ShouldBeBoolean = gimme.Infer<typeof Schema>;
    });

    it("Allow booleans", () => {
        expect(Schema.parse(true)).toBe(true);
        expect(Schema.parse(false)).toBe(false);
    });

    it("Prohibit non booleans", () => {
        expect(Schema.ok("true")).toBe(false);
        expect(Schema.ok(1)).toBe(false);
        expect(Schema.ok({})).toBe(false);
    });

    it("Coerce", () => {
        expect(Schema.coerce().ok("hello")).toBe(true);
        expect(Schema.coerce().parse(1)).toBe(true);
        expect(Schema.coerce().parse(0)).toBe(false);
        expect(Schema.coerce().parse(null)).toBe(false);
        expect(Schema.coerce().parse(undefined)).toBe(false);
    });
});
