import gimme from "../src";

describe("gimme.sym()", () => {
    const Schema = gimme.sym();

    it("Infer type", () => {
        type ShouldBeSymbol = gimme.Infer<typeof Schema>;
    });

    it("Allow symbol", () => {
        expect(Schema.ok(Symbol.for("sxlisdgfvouslzb"))).toBe(true);
        expect(Schema.ok(Symbol("yxcvsdgfwergv"))).toBe(true);
    });

    it("Prohibit non symbols", () => {
        expect(Schema.ok("true")).toBe(false);
        expect(Schema.ok(1)).toBe(false);
        expect(Schema.ok({})).toBe(false);
    });
});
