import gimme from "../src";

describe("gimme.any()", () => {
    const Schema = gimme.any();

    it("Infers", () => {
        type ShouldBeAny = gimme.Infer<typeof Schema>;
    });

    it("Parses", () => {
        expect(Schema.parse(true)).toBe(true);
        expect(Schema.parse(false)).toBe(false);
        expect(Schema.parse(undefined)).toBe(undefined);
        expect(Schema.parse(null)).toBe(null);
        expect(Schema.parse("hello")).toBe("hello");
        expect(Schema.parse(fetch)).toBe(fetch);
    });
});