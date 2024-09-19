import g from "../src";

describe("gimme.obj()", () => {
    const Schema = g.obj({
        name: g.str(),
        age: g.num(),
        address: g
            .obj({
                street: g.str(),
                city: g.str(),
            })
            .optional(),
    });
    const obj = {
        name: "John",
        age: 22,
    };

    it("Infer type", () => {
        type ShouldBeObject = g.Infer<typeof Schema>;
    });

    it("Parses", () => {
        expect(Schema.ok(obj)).toBe(true);
        expect(Schema.ok({ name: "andre" })).toBe(false);
        expect(Schema.ok({ ...obj, x: 33 })).toBe(true);
    });

    it("Prohibits", () => {
        expect(Schema.ok("true")).toBe(false);
        expect(Schema.ok(1)).toBe(false);
        expect(Schema.ok({})).toBe(false);
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
