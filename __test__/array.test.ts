import gimme from "../src";

describe("gimme.arr()", () => {
    const Schema = gimme.arr(gimme.str());
    const arr = ["a", "b", "c"];

    it("Infer type", () => {
        type ShouldBeArray = gimme.Infer<typeof Schema>;
    });

    it("Allow arrays", () => {
        expect(Schema.ok(arr)).toBe(true);
        expect(Schema.ok(["a", 44, "c"])).toBe(false);
        expect(Schema.ok([])).toBe(true);
    });

    it("Prohibit non arrays", () => {
        expect(Schema.ok("true")).toBe(false);
        expect(Schema.ok(1)).toBe(false);
        expect(Schema.ok({})).toBe(false);
    });

    it("Coerce", () => {
        expect(Schema.coerce().ok(arr)).toBe(true);
    });

    it("Special refines", () => {
        // min len
        expect(Schema.minLen(4).ok(arr)).toBe(false);
        expect(Schema.minLen(2).ok(arr)).toBe(true);
        // max len
        expect(Schema.maxLen(1).ok(arr)).toBe(false);
        expect(Schema.maxLen(6).ok(arr)).toBe(true);
        // len
        expect(Schema.len(1).ok(arr)).toBe(false);
        expect(Schema.len(3).ok(arr)).toBe(true);
    });
});
