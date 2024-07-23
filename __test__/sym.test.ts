import g from "../src";

describe("gimme.sym()", () => {
    const Schema = g.sym();

    it("Infers", () => {
        type ShouldBeSymbol = g.Infer<typeof Schema>;
    });

    it("Allows", () => {
        expect(Schema.ok(Symbol.for("sxlisdgfvouslzb"))).toBe(true);
        expect(Schema.ok(Symbol("yxcvsdgfwergv"))).toBe(true);
    });

    it("Prohibits", () => {
        expect(Schema.ok("true")).toBe(false);
        expect(Schema.ok(1)).toBe(false);
        expect(Schema.ok({})).toBe(false);
    });
});
