import g from "../src";

describe("gimme.func()", () => {
    const Schema = g.func();

    it("Infers", () => {
        type ShouldBeFunction = g.Infer<typeof Schema>;
    });

    it("Parses", () => {
        expect(Schema.ok(FormData)).toBe(true);
        expect(Schema.ok(() => null)).toBe(true);
        expect(Schema.ok(fetch)).toBe(true);
    });

    it("Refines", () => {
        // primitive
        expect(Schema.primitive().ok(FormData)).toBe(false);
        expect(Schema.primitive().ok(fetch)).toBe(true);
        // ctr
        expect(Schema.ctr().ok(FormData)).toBe(true);
        expect(Schema.ctr().ok(fetch)).toBe(false);
    });
});
