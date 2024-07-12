import gimme from "../src";

describe("gimme.obj()", () => {
    const Schema = gimme.obj({
        name: gimme.str(),
        age: gimme.num(),
        address: gimme
            .obj({
                street: gimme.str(),
                city: gimme.str(),
            })
            .optional(),
    });
    const obj = {
        name: "John",
        age: 22,
    };

    it("Infer type", () => {
        type ShouldBeObject = gimme.Infer<typeof Schema>;
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
