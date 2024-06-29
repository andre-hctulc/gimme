import gimme from "../src";

describe("gimme.func()", () => {
    const Schema = gimme.func();

    it("Infer type", () => {
        type ShouldBeFunction = gimme.Infer<typeof Schema>;
    });

    it("Allow functions", () => {
        expect(Schema.ok(FormData)).toBe(true);
        expect(Schema.ok(() => null)).toBe(true);
        expect(Schema.ok(fetch)).toBe(true);
    });

    it("Special refines", () => {
        expect(Schema.primitive().ok(FormData)).toBe(false);
        expect(Schema.primitive().ok(fetch)).toBe(true);
        expect(Schema.ok(() => null)).toBe(true);
        expect(Schema.ok(fetch)).toBe(true);
    });
});
