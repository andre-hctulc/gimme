import g from "../src";

describe("gimme.rec()", () => {
    const Schema = g.rec(g.str());
    const obj = {
        name: "John",
        age: "22",
    };

    it("Infer type", () => {
        type ShouldBeRecord = g.Infer<typeof Schema>;
    });

    it("Parses", () => {
        expect(Schema.ok(obj)).toBe(true);
        expect(Schema.ok({ name: "andre" })).toBe(true);
        expect(Schema.ok({})).toBe(true);
    });

    it("Prohibits", () => {
        expect(Schema.ok("true")).toBe(false);
        expect(Schema.ok(1)).toBe(false);
        expect(Schema.ok({ ...obj, x: 33 })).toBe(false);
    });

    it("Refines", () => {
        // min props
        expect(Schema.minProps(3).ok(obj)).toBe(false);
        expect(Schema.minProps(1).ok(obj)).toBe(true);
        // max props
        expect(Schema.maxProps(1).ok(obj)).toBe(false);
        expect(Schema.maxProps(6).ok(obj)).toBe(true);
    });
});
