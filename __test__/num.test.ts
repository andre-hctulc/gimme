import gimme from "../src";

describe("gimme.num()", () => {
    const Schema = gimme.num();

    it("Infer type", () => {
        type ShouldBeNumber = gimme.Infer<typeof Schema>;
    });

    it("Allow numbers", () => {
        expect(Schema.parse(44)).toBe(44);
        expect(() => Schema.parse(Infinity)).toThrow();
        expect(() => Schema.parse("Infinity")).toThrow();
    });

    it("Prohibit non numbers", () => {
        expect(() => Schema.parse("undefined")).toThrow();
        expect(() => Schema.parse(null)).toThrow();
        expect(() => Schema.parse(true)).toThrow();
    });

    it("Coerce", () => {
        expect(Schema.coerce().parse("55")).toBe(55);
        expect(() => Schema.coerce().parse("xxx")).toThrow();
    });

    it("Special refines", () => {
        // min/max
        expect(Schema.max(10).parse(5)).toBe(5);
        expect(Schema.min(10).parse(15)).toBe(15);
        expect(() => Schema.max(10).parse(11)).toThrow();
        expect(() => Schema.min(10).parse(9)).toThrow();
        // allowInfinity
        expect(Schema.allowInfinity().parse(Infinity)).toBe(Infinity);
        expect(Schema.allowInfinity().parse(-Infinity)).toBe(-Infinity);
        // allowInfinity (positive)
        expect(() => Schema.allowInfinity("positive").parse(-Infinity)).toThrow();
        expect(Schema.allowInfinity("positive").parse(Infinity)).toBe(Infinity);
        // allowInfinity (negative)
        expect(() => Schema.allowInfinity("negative").parse(Infinity)).toThrow();
        expect(Schema.allowInfinity("negative").parse(-Infinity)).toBe(-Infinity);
    });
});
